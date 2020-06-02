'use strict'
const ValidationContract = require('../validators/fluent-validator');
const repository = require('../repositories/product-repository');
const azure = require('azure-storage');
const guid = require('guid');
const config = require('../config');

exports.get = async(req, res, next) =>{
    try{
    const data = await repository.get();
    return res.status(200).send(data);
    }
    catch(e){
        res.status(500).send({data:e, message:"Falha ao processar sua requisição"});
    }
};
    

exports.getBySlug = async(req, res, next) =>{
    try{
        const data = await repository.getBySlug(req.params.slug)
        res.status(200).send(data);
    }
    catch(e){
        res.status(400).send(e);
    }    
};

exports.getById = async (req, res, next) =>{
    try{
     const data = await repository.getById(req.params.id)
    res.status(200).send(data);
    }
    catch(e){
        res.status(400).send(e);
    }    
};

exports.getByTag = async(req,res,next) => {
    try{
        const data = await repository.getByTag(req.params.tag)
        res.status(200).send(data);
    }
    catch(e){
        res.status(400).send({message:"Erro ao buscar pela tag.", data:e});
    }
    
       
};

exports.findOneSlug = async(req, res, next) =>{
    try{
        const data = await repository.findOneSlug(req.params.slug);
        res.status(200).send(data);
    }
    catch(e){
        res.status(400).send(e);
    }   
};

exports.post = async(req, res, next) =>{
    let contract = new ValidationContract();
    contract.hasMinLen(req.body.title, 3, 'O título deve ter no mínimo 3 caracteres.');
    contract.hasMinLen(req.body.slug, 3, 'O slug deve ter no mínimo 3 caracteres.');
    contract.hasMinLen(req.body.description, 3, 'A descrição deve ter no mínimo 3 caracteres.');
    
    
    //se os dados forem inválidos
    if(!contract.isValid()){
        res.status(400).send(contract.errors()).end();
        return;
    }

    try{

        const blobSvc = azure.createBlobService(config.containerConnectionString);

        let filename = guid.raw().toString() + ".jpg";
        let rawdata = req.body.image;
        let matches = rawdata.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        let type = matches[1];
        let buffer = new Buffer(matches[2], "base64");

        await blobSvc.createBlockBlobFromText("product-images",filename, buffer,{
            contentType: type
        },
        function (error, result, response){
            if(error)
                filename = "default.product.png"
        }
        )


        const data = await repository.create({
            title:req.body.title,
            slug:req.body.slug,
            description:req.body.description,
            price:req.body.price,
            tags:req.body.tags,
            image: "https://nodefree.blob.core.windows.net/product-images/"  + filename

        });
        res.status(201).send({message:'Produto cadastrado com sucesso!'});
    }catch(e){
        console.log(e);
        res.status(400).send({message:'Falha ao cadastrar o produto!',data:e.toString()});
    }
         
    
};

exports.put = async(req,res,next)=>{    
    try{
        await repository.update(req.params.id, req.body);
        res.status(200).send({message:'Produto atualizado com sucesso!'});
    }catch(e){
        res.status(400).send({message:'Falha ao atualizar o produto!',data:e});
    }    
};

exports.delete = async(req,res,next)=>{
    try{
        await repository.delete(req.body.id) ;
        res.status(200).send({message:'Produto removido com sucesso!'});

    }
    catch(e){
        res.status(400).send({message:'Falha ao remover o produto!',data:e});

    }
    
};