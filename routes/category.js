const express = require('express');
const router = express.Router();

const category_model = require('../models/category_model');
// const product_model = require('../models/product_model');

router.post('/add', (req, resp) => {

    try {
        category_model.find({ name: { $regex: '^' + (req.body.name).trim() + '$', $options: 'i' } }).count()
            .then((data_count) => {
                if (data_count === 0) {
                    category_model.aggregate([{
                        $group:
                        {
                            _id: "null",
                            maxCount: { $max: "$count" }
                        }
                    }]).then((all_data_count) => {
                        let id = "10000";
                        let c;
                        if (all_data_count.length > 0) {
                            id = id + String(all_data_count[0].maxCount + 1);
                            c = all_data_count[0].maxCount + 1;
                        }
                        if (all_data_count.length == 0) {
                            id = id + String(1);
                            c = 1;
                        }

                        req.body.id = id;
                        req.body.count = c;
                        req.body.created_at = new Date();
                        category_model(req.body).save().then((data_save) => {
                            resp.json({ status: true, message: "Record Added", data: data_save });
                        });
                    });
                }
                else {
                    resp.json({ status: false, message: "Record Already Exists" });
                }
            })
    }
    catch (error) {
        console.log(error);
        resp.json({ status: false, message: "Server Error Please Try Again", error: error });
    }


});

router.put('/update', (req, resp) => {

    try {
        console.log(req.body);
        category_model.find({ name: { $regex: '^' + (req.body.name).trim() + '$', $options: 'i' } }).then((duplication_data) => {
            if (duplication_data.length == 1 && duplication_data[0].id == req.body.id) {
                category_model.updateOne({ id: (req.body.id).trim() }, { $set: { name: req.body.name, isActive: req.body.isActive, update_at: new Date() } }).then((update_data) => {
                    resp.json({ status: true, message: "Record Updated", data: update_data });
                });
            }
            else {
                if (duplication_data.length == 0) {
                    category_model.updateOne({ id: (req.body.id).trim() }, { $set: { name: req.body.name, isActive: req.body.isActive, update_at: new Date() } }).then((update_data) => {
                        resp.json({ status: true, message: "Record Updated", data: update_data });
                    });
                }
                else {
                    resp.json({ status: false, message: "Record Already Exists" });
                }
            }
        });
    }
    catch (error) {
        console.log(error);
        resp.json({ status: false, message: "Server Error Please Try Again", error: error });
    }
});

router.get('/findAll', (req, resp) => {

    try {
        category_model.find({ isActive: true }).then((find_data) => {
            resp.json({ status: true, data: find_data });
        });
    }
    catch (error) {
        console.log(error);
        resp.json({ status: false, message: "Server Error Please Try Again", error: error });
    }
});

router.get('/findById/:id', (req, resp) => {
    try {
        category_model.findOne({ id: req.params.id }).then((find_data) => {
            resp.json({ status: true, data: find_data });
        });
    }
    catch (error) {
        console.log(error);
        resp.json({ status: false, message: "Server Error Please Try Again", error: error });
    }
});

router.delete('/delete/:id', (req, resp) => {

    // try {
        // product_model.countDocuments({ category_id: req.params.id }).then((found_documents) => {
        //     if (found_documents == 0) {
                category_model.deleteOne({ id: req.params.id }).then((find_data) => {
                    resp.json({ status: true, message: "Record Deleted", data: find_data });
                });
    //         }
    //         else if (found_documents > 0) {
    //             resp.json({ status: false, message: "Selected Category Is In Use" });
    //         }

    //     })
    // }
    // catch (error) {
    //     console.log(error);
    //     resp.json({ status: false, message: "Server Error Please Try Again", error: error });
    // }
});

router.get('/list', async function (req, resp) {

    try {
        let sort = {};
        sort[req.query.sort_field] = Number(req.query.sort_type);
        let sort1 = {};
        sort1["created_at"] = -1;

        let data = await category_model.aggregate(
            [
                {
                    $match: {
                        "$or":
                            [
                                { id: { $regex: ".*" + String(req.query.name).trim() + ".*", $options: 'i' } },
                                { name: { $regex: ".*" + String(req.query.name).trim() + ".*", $options: 'i' } },
                            ]
                    }
                },
                { $sort: sort1 },

                {
                    $facet:
                    {
                        metadata: [{ $count: "total" }, { $addFields: { page: Number(req.query.page) } }, { $addFields: { limit: Number(req.query.limit || 3) } }],
                        data: [{ $skip: Number(req.query.page - 1) * Number(req.query.limit || 3) }, { $limit: Number(req.query.limit || 3) }, { $sort: sort }]
                    }
                }
            ]);
        resp.json({ status: true, data: data });
    }
    catch (error) {
        console.log(error);
        resp.json({ status: false, message: "Server Error Please Try Again", error: error });
    }
});

module.exports = router;