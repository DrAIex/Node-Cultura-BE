var express = require('express')
var router = express.Router()
const Category = require('../models/category')
const Item = require('../models/item')

// SDK de Mercado Pago
const { MercadoPagoConfig, Preference } = require('mercadopago')

router.get('/', function(req, res, next) {
  res.send('Called root api')
}) 

// //Get all Method
// router.get('/getAllCategories', async (req, res) => {
//   try{
//     const data = await Category.find()
//     res.json(data)
//   }
//   catch(error){
//     res.status(500).json({message: error.message})
//   }
// })

// //Get by ID Method
// router.get('/getOneCategory/:id', async (req, res) => {
//   try{
//     const data = await Item.find({ categoryId: req.params.id })
//     res.json(data)
//   }
//   catch(error){
//     res.status(500).json({message: error.message})
//   }
// })

router.get('/getAllItems', async (req, res) => {
  console.log('getAllItems')
  try{
    const data = await Item.find()
    res.json(data)
  }
  catch(error){
    res.status(500).json({message: error.message})
  }
})

router.post('/getTotalPrice', async (req, res) => {
  try{
    if (!req || !req.body || !req.body.length)
      return res.status(403).json({message: "Verbotten"})

    const queryArray = req.body.map(({ id }) => id)
    
    const items = await Item.find({itemId: { $in: queryArray}}).lean()

    const decoratedItems = req.body.map(requestItem => {
      const item = items.find(i => i.itemId === requestItem.id)
      if (item) return {
        ...item,
        amount: requestItem.amount
      }
    })

    const result = decoratedItems.reduce((acc, obj) => acc + (obj.amount * obj.price), 0)

    res.json({
      totalPrice: result
    })
  }
  catch(error){
    res.status(500).json({message: error.message})
  }
})

router.post('/getPreference', async (req, res) => {
  try{
    // console.log('req?.body?.cartItems', req?.body?.cartItems)
    if (!req || !req.body || !req?.body?.cartItems?.length)
      return res.status(403).json({message: "Verbotten"})
    console.log(req.body)

    const { cartItems, formValues } = req.body

    const queryArray = cartItems.map(({ id }) => id)
    const items = await Item.find({itemId: { $in: queryArray}}).lean()
    const decoratedItems = cartItems.map(requestItem => {
      const item = items.find(i => i.itemId === requestItem.id)
      if (item) return {
        ...item,
        amount: requestItem.amount
      }
    })

    // Agrega credenciales
    const client = new MercadoPagoConfig({
      // accessToken: 'TEST-1917843971819159-030417-ac850a118c56090b434c4b3bedd09d34-1700322474',
      accessToken: 'APP_USR-7301514635207653-030814-b94a5f40a7ad993f2a5b46dd44ce6890-1716962427',
      options: { timeout: 5000, idempotencyKey: 'abc' }
    })

    const preference = new Preference(client)

    const {
      name,
      surname,
      email,
      phone_number,
      id_number,
      street_name,
      // street_number,
      // zip_code
    } = formValues
    console.log('formValues', formValues)
    const now = new Date()

    const preferenceBody = {
      items: decoratedItems.map(({
        itemId,
        title,
        price,
        amount
      }) => ({
        id: itemId,
        title,
        unit_price: price,
        quantity: amount,
        currency_id: 'COP'
      })),
      back_urls: {
        success: "https://cultura-liquida.com/check-out/success",
        failure: "https://cultura-liquida.com/check-out/failure",
        pending: "https://cultura-liquida.com/check-out/pending"
      },
      // init_point: 'http://localhost:3001',
      auto_return: "approved",
      payer: {
        name,
        surname,
        email,
        date_created: now.toISOString(),
        phone: {
          area_code: '57',
          number: phone_number
        },
        identification: {
          type: 'CC',
          number: id_number
        },
        address: {
          street_name,
          // street_number,
          // zip_code
        }
      },
      shipments: {
        receiver_address: {
          // zip_code
          street_name,
          // street_number
        }
      }
    }

    const preferenceResult = await preference.create({
      body: preferenceBody,
    })
    // .then(console.log)
    // .catch(console.log);

    console.log('preferenceResult', preferenceResult)

    res.json({
      preference: preferenceResult
    })
  }
  catch(error){
    res.status(500).json({message: error.message})
  }
})

router.post('/getNotification', async (req, res) => {
  // TODO:
  try{
    if (!req || !req.body || !req.body.length)
      return res.status(403).json({message: "Verbotten"})

    const queryArray = req.body.map(({ id }) => id)
    
    const items = await Item.find({itemId: { $in: queryArray}}).lean()

    const decoratedItems = req.body.map(requestItem => {
      const item = items.find(i => i.itemId === requestItem.id)
      if (item) return {
        ...item,
        amount: requestItem.amount
      }
    })

    const result = decoratedItems.reduce((acc, obj) => acc + (obj.amount * obj.price), 0)

    res.json({
      totalPrice: result
    })
  }
  catch(error){
    res.status(500).json({message: error.message})
  }
})

//Update by ID Method
router.patch('/update/:id', async (req, res) => {
  console.log('try update/:id', req)

  try {

    // if (!req || !req.body || !req?.body?.cartItems?.length)
    //   return res.status(403).json({message: "Verbotten"})
    // console.log('req', req)
  
    console.log('try')
    const id = req.params.id
    const updatedData = req.body
    const options = { new: false }

    const result = await Item.findByIdAndUpdate(
      id,
      updatedData,
      options
    )

    if (!response.ok) {
      console.log('!response.ok')
    }

    res.send(result)
  }
  catch (error) {
    res.status(400).json({ message: error.message })
  }
})


router.post('/update', async (req, res) => {
  console.log('update')
  try{
    if (!req || !req.body || !req?.body?.cartItems?.length)
      return res.status(403).json({message: "Verbotten"})
    console.log(req.body)

    const { cartItems, formValues } = req.body

    const queryArray = cartItems.map(({ itemId }) => itemId)
    const items = await Item.find({itemId: { $in: queryArray}}).lean()
    const itemsALL = await Item.find().lean()
    console.log('itemsALL', itemsALL)
    const decoratedItems = cartItems.map(requestItem => {
      const item = items.find(i => i.itemId === requestItem.itemId)
      const {amount, stock, ...restOfValues} = item
      const ob = {
        ...restOfValues,
        stock: stock - requestItem.amount // dont have amount - from db
      }
      console.log('ob', ob)
      return ob
    })

    // res.send(decoratedItems)

    const updatePromises = decoratedItems.map(async (item) => {
      const updatedItem = await Item.findOneAndUpdate(
        { itemId: item.itemId },
        { $set: item },
        { new: true, runValidators: true }
      );

      console.log('updatedItem', updatedItem)

      return updatedItem;
    });

    // Wait for all updates to complete
    const updatedItems = await Promise.all(updatePromises);

    res.send(updatedItems);

    // res.json({
    //   preference: decoratedItems
    // })

  }
  catch(error){
    res.status(500).json({message: error.message})
  }
})


//Delete by ID Method
// router.delete('/delete/:id', async (req, res) => {
//   try {
//     const id = req.params.id
//     const data = await Model.findByIdAndDelete(id)
//     res.send(`Document with ${data.name} has been deleted..`)
//   }
//   catch (error) {
//     res.status(400).json({ message: error.message })
//   }
// })

module.exports = router
