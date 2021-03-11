var mainService = require('../services/mainService');

module.exports = function(app){

    app.post('/api/fetch',mainService.fetch)
}