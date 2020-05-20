const service = require('restana')()

service
    .get('/', async (req, res) => {
        res.send("hello")
    })

service.get('/version', function (req, res) {
    res.body = {
        version: '1.0.0'
    }
    res.send()
})

service.start(8000).then((server) => {
    console.log("Listening to 8000...")
})