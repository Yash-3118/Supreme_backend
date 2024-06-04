const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
// const mail = require("../../middleware/mail")

const users_model = require('../models/users_model');

router.post('/add', (req, resp) => {

    
    users_model.find({"$or":[{ email: { $regex: '^' + (req.body.email).trim() + '$', $options: 'i' } },{mobile : req.body.mobile_number}]}).countDocuments()
        .then((data_count) => {
            if (data_count == 0) {
                users_model.aggregate([{
                    $group:
                    {
                        _id: "null",
                        maxCount: { $max: "$count" }
                    }
                }]).then(async (all_data_count) => {
                    let id = "US10000";
                    let c;
                    if (all_data_count.length > 0) {
                        id = id + String(all_data_count[0].maxCount + 1);
                        c = Number(all_data_count[0].maxCount) + 1;
                    }
                    if (all_data_count.length == 0) {
                        id = id + 1;
                        c = 1;
                    }
                    let bcrypt_password = await bcrypt.hash(req.body.password, 10);

                    req.body['id'] = id;
                    req.body['count'] = c;
                    req.body['password_string'] = req.body['password'];
                    req.body['password'] = bcrypt_password;
                    req.body['created_at'] = new Date();

                    users_model(req.body).save().then(async(data_save) => {
                        // let HTML = "<html>" +
                        // "<head>" +
                        // "<style>" +
                        // "Table,div {" +
                        // "font-size: x-small;" +
                        // "font-family: verdana;" +
                        // "}" +
                        // "</style>" +
                        // "</head>" +
                        // "<body>" +
                        // "<div>" +
                        // "Dear "+req.body.first_name+" "+req.body.last_name+"<br />" +
                        // "<br />You have successfully registered to Supreme Foods And Agros <br /><br />" +
                        // "</div>" +
                        // "<div>" +
                        // "Regards," +
                        // "<br />Customer Support," +
                        // "<br />Supreme Foods And Agros<br /><br />" +
                        // "</div>" +
                        // "</body>" +
                        // "</html>";
                        // await mail.method(req.body.email,"",HTML,"Account Registered");
                        resp.json({ status: true, message: "Record Added", data: data_save });
                    });
                });
            }
            else {
                resp.json({ status: false, message: "Record Already Exists" });
            }
        })
});

router.put('/update', (req, resp) => {
    users_model.find({"$or":[{ email: { $regex: '^' + (req.body.email).trim() + '$', $options: 'i' } },{mobile : req.body.mobile_number}]}).then((duplication_data) => {
        if (duplication_data.length == 1 && duplication_data[0].id == req.body.id) {
            users_model.updateOne({id:req.body.id}, {$set:{first_name: req.body.first_name, last_name: req.body. last_name, email:req.body.email, mobileNumber:req.body.mobileNumber, address:req.body.address, city:req.body.city, state:req.body.state, pincode:req.body.pincode, country:req.body.country, isActive:req.body.isActive, updated_at:new Date()}}).then((updated_data)=>{
                resp.json({ status: true, message: "Record Updated", data: updated_data });
            });
        }
        else {
            if (duplication_data == 0) {
                users_model.updateOne({id:req.body.id}, {$set:{first_name: req.body.first_name, last_name: req.body. last_name, email:req.body.email, mobileNumber:req.body.mobileNumber, address:req.body.address, city:req.body.city, state:req.body.state, pincode:req.body.pincode, country:req.body.country, updated_at:new Date()}}).then((update_data) => {
                    resp.json({ status: true, message: "Record Updated", data: update_data });
                });
            }
            else {
                resp.json({ status: false, message: "Record Already Exists" });
            }
        }
    });
});

router.get('/findAll', (req, resp) => {
    users_model.find().then((find_data) => {
        resp.json({ status: true, data: find_data });
    });
});

router.get('/findById/:id', (req, resp) => {
    users_model.findOne({ id: req.params.id }, {password:0, password_string:0}).then((find_data) => {
        resp.json({ status: true, data: find_data });
    });
});

router.delete('/delete/:id', (req, resp) => {
    users_model.deleteOne({ id: req.params.id }).then((find_data) => {
        resp.json({ status: true, message:"Record Deleted", data: find_data });
    });
});

router.get('/list', async function (req, resp) {
    // let id = new mongoose.Types.ObjectId(req.query.id);
    var sort = {};
    sort[req.query.sort_field] = Number(req.query.sort_type);

    let data = await users_model.aggregate(
        [

            {
                $match: {
                    "$or":
                        [
                            // { "_id": id },
                            { id: { $regex: ".*" + String(req.query.name).trim() + ".*", $options: 'i' } },
                            { name: { $regex: ".*" + String(req.query.name).trim() + ".*", $options: 'i' } },
                            { mobileNumber: { $regex: ".*" + String(req.query.name).trim() + ".*", $options: 'i' } },
                            { email: { $regex: ".*" + String(req.query.name).trim() + ".*", $options: 'i' } },
                        ]
                }
            },
            { $sort: sort },
            {
                $facet:
                {
                    metadata: [{ $count: "total" }, { $addFields: { page: Number(req.query.page) } }, { $addFields: { limit: Number(req.query.limit || 3) } }],
                    data: [{ $skip: Number(req.query.page - 1) * Number(req.query.limit || 3) }, { $limit: Number(req.query.limit || 3) }]
                }
            }
        ]);
    resp.json({ status: true, data: data });
});

module.exports = router;