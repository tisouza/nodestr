'use strict'

const mongoose = require('mongoose');
const Order = mongoose.model("Order");


exports.get = async () =>{
    var res = await Order.find({},"number status items.price items.quantity")
        .populate("customer","name")
        .populate("items.product","title");
    return res;
};

exports.create = async(data) =>{   
    var order = new Order(data);
    await order.save();  
    
};

