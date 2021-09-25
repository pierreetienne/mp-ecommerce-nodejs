var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser')
var port = process.env.PORT || 3000

// SDK de Mercado Pago
const mercadopago = require('mercadopago');

// Agrega credenciales
mercadopago.configure({
    access_token: 'APP_USR-2572771298846850-120119-a50dbddca35ac9b7e15118d47b111b5a-681067803',
    integrator_id: 'dev_24c65fb163bf11ea96500242ac130004',
});

var app = express();

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(bodyParser.json());
app.use(express.static('assets'));

app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function (req, res) {
    res.render('home', {view: 'home'});
});

app.get('/detail', function (req, res) {
    console.log(req.query)
    const imageURL = 'https://pierreetienne-mp-commerce-node.herokuapp.com/' + req.query.img.substr(1)
    let preference = {
            items: [
                {
                    id: 1234,
                    description: "Dispositivo móvil de Tienda e-commerce",
                    title: req.query.title,
                    picture_url: imageURL,
                    unit_price: parseInt(req.query.price),
                    quantity: parseInt(req.query.unit),
                }
            ],
            back_urls: {
                success: "https://pierreetienne-mp-commerce-node.herokuapp.com/webhook/s",
                failure: "https://pierreetienne-mp-commerce-node.herokuapp.com/webhook/f",
                pending: "https://pierreetienne-mp-commerce-node.herokuapp.com/webhook/p"
            },
            auto_return: "approved",
            payment_methods: {
                excluded_payment_methods: [
                    {
                        id: "amex"
                    }
                ],
                excluded_payment_types: [
                    {
                        id: "atm",
                    },
                ],
                installments: 6
            },
            statement_descriptor: "Tienda e-commerce",
            notification_url: "https://pierreetienne-mp-commerce-node.herokuapp.com/webhook",
            external_reference: "etienne.pradere@gmail.com",
            payer: {
                name: "Lalo",
                surname: "Landa",
                email: "test_user_83958037@testuser.com",
                date_created: "2015-06-02T12:58:41.425-04:00",
                phone: {
                    area_code: "11",
                    number: 22223333
                },
                address: {
                    street_name: "Falsa",
                    street_number: 123,
                    zip_code: "1111"
                }

            }
        }
    ;

    mercadopago.preferences.create(preference)
        .then(function (response) {
            // Este valor reemplazará el string "<%= global.id %>" en tu HTML
            global.id = response.body.id;
            response.body['view'] = 'item'
            res.render('detail', response.body);
        }).catch(function (error) {
        console.log(error);
    });

});

app.post('/webhook', function (req, res) {
    console.log('post webhook data:', req.body);
    console.log('post webhook query param ', req.query)
    res.sendStatus(200);
})

app.get('/webhook', function (req, res) {
    console.log('get webhook data:', req.body);
    console.log('get webhook query param ', req.query)
    res.sendStatus(200);
})

app.get('/webhook/s', function (req, res) {
    console.log('s:', req.body);
    res.json({
        status: "El pago haya sido exitoso.",
        external_reference: req.query.external_reference,
        payment_id: req.query.payment_id ? req.query.payment_id : req.query.collection_id,
        payment_method_id: req.query.payment_method_id
    })
})

app.get('/webhook/f', function (req, res) {
    console.log('f:', req.body);
    res.json({
        status: "El pago ha sido “rechazado” o no ha finalizado.",
        external_reference: req.query.external_reference,
        payment_id: req.query.payment_id ? req.query.payment_id : req.query.collection_id,
        payment_method_id: req.query.payment_method_id
    })
})

app.get('/webhook/p', function (req, res) {
    console.log('p:', req.body);
    res.json({
        status: "PENDING",
        external_reference: req.query.external_reference,
        payment_id: req.query.payment_id ? req.query.payment_id : req.query.collection_id,
        payment_method_id: req.query.payment_method_id
    })

})

app.listen(port);