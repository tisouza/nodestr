'use strict'

const repository = require('../repositories/order-repository');
const guid = require('guid');
const authService = require('../services/auth-service');

exports.get = async(req, res, next) =>{
    try{
    const data = await repository.get();
    return res.status(200).send(data);
    }
    catch(e){
        res.status(500).send({data:e, message:"Falha ao processar sua requisição"});
    }
};

exports.post = async(req, res, next) =>{    
    try{
        const token = req.body.token || req.query.token || req.headers["x-access-token"];

        const data = await authService.decodeToken(token);

        await repository.create({
            customer:data.id,
            number: guid.raw().substring(0,6),
            items:req.body.items
        });
        res.status(201).send({message:'Pedido cadastrado com sucesso!'});
    }catch(e){
        res.status(400).send({message:'Falha ao cadastrar o pedido!',data:e});
    }
        
    
};