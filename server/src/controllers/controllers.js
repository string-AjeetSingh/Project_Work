const { emit } = require('process');
const isDebugging = require('./../myLib/ifDebugging/ifDebugging');
const alib = require('./../myLib/PracLib/alib');
const utils = require('./../utils/utils');
const path = require('path');
const { Double } = require('mongodb');
const { DefaultDeserializer } = require('v8');

const debug = new isDebugging(process.env.IS_DEBUGGING);

module.exports.rough = async (req, res) => {

    let theNo = await utils.setPrevNo('Jobs');
    if (theNo) {
        res.json({
            status: 1,
            message: `the new no is : ${theNo}`
        })
    } else {
        res.json({
            status: 0,
            message: `false from setPrevNo()`
        })
    }
};

module.exports.login = function (req, res, next) {

    if (req.signedCookies.user) {
        res.status(200);
        res.json({
            status: 0, message: 'already had cookie'
        })
    }
    else {
        res.cookie('user', 'hero', { signed: true });
    }

    res.status(200);
    res.json({
        status: 1
    });

}

module.exports.logout = (req, res) => {

    if (req.signedCookies.user) {
        res.clearCookie('user');
        res.status(200).json({
            status: 1, messag: "succesfully log out."
        })
    }
    else {
        res.status(200).json({
            status: 0, messag: "no user yet to logout."
        })
    }
};

module.exports.token = function (req, res, next) {


    debug.console('from token control - ');
    debug.console('data form client body  ', req.body);

    let token = req.theJwt.sign({
        userData: {
            email: req.body.userData.email
        }
    }, process.env.SECRATE, { expiresIn: '3d' });

    debug.console('creted token : ', token);

    if (req.signedCookies.token) {       //if user exists

        debug.console('pre exist user ');

        res.clearCookie('token');        // clear old one
        debug.console('cookie must be clean');

        res.cookie('token', token, {
            httpOnly: true,
            signed: true,
            maxAge: 1000 * 60 * 60 * 24 * 2
        });

        debug.console('cookie must be setteed');

        res.status(200);
        res.json({
            status: 1, message: 'succesfully have token'
        }).end();
        return;
    }

    debug.console('pure token call');

    res.cookie('token', token, {
        signed: true,
        maxAge: 1000 * 60 * 60 * 24 * 2
    });

    res.status(200);
    res.json({
        status: 1, message: 'succesfully have token'
    });


}

module.exports.tryConnection = async (req, res, next) => {

    const mongo = new alib('Work', process.env.MONGOSTRING);
    mongo.setCollection('Jobs');
    let result = await mongo.find();
    debug.console('the res is : ', result);

    await mongo.over();
    res.json({
        messag: 'must be connected'
    })
};

module.exports.createPost = async (req, res, next) => {

    debug.console('From CreatePost -');

    req.body.data = utils.jsonParseIfString(req.body.data);
    debug.console('the req.body.data : ', req.body.data);



    debug.console('the req.file : ', req.file);
    if (req.body.data) {

        let upload = {};
        let matchList = [
            "title", "desciption", "requirments",
            "qualifications", "responsibilities",
            "github", "email", "location",
            "x", "companyName", "tags"
        ]

        req.body.data.forEach((item) => {
            matchList.forEach((match) => {
                if (item.inputData.name === match) {
                    upload[match] = item.inputData.data;
                }
            })
        })

        let theNo = await utils.setPrevNo('Jobs');
        if (!theNo) {
            console.error("no number to use with update");
            res.json({
                status: -1, message: 'no number to use with update'
            })
            return;
        }

        const mongo = new alib('Work', process.env.MONGOSTRING);
        mongo.setCollection('Jobs');
        let result = await mongo.insertOne({
            "Document": "job",
            "from": req.userData.email,
            "jobData": {
                "title": upload.title,
                "description": upload.desciption,
                "requirements": upload.requirments,
                "qualifications": upload.qualifications
            },
            "jobSocialData": {
                "github": upload.github,
                "email": upload.email,
                "x": upload.x
            },
            "companyName": upload.companyName,
            "img": req.file ? path.join(process.env.SERVER_BASE, req.file.path) : null,
            "location": upload.location,
            "no": theNo,
            "Applied": [],
            "tags": upload.tags    //need  work pending ...

        });

        debug.console('result from server : ', result);
        /* 
*/
        mongo.over();
        res.json({
            message: "data must be set to database",
            data: upload
        })


        return;
    }
    else {
        res.status(404).json({
            message: 'from createPost'
        }).end()
        return;
    }



};

module.exports.fetchPosts = async (req, res, next) => {
    const mongo = new alib('Work', process.env.MONGOSTRING);
    mongo.setCollection('Jobs');
    let result = await mongo.find({ 'Document': 'job' });

    debug.console('result from server : ', result);
    mongo.over();
    res.json({
        status: 1,
        messag: 'data must be fetched',
        data: result
    })

};

module.exports.fetchAPosts = async (req, res, next) => {
    debug.console('from fetchAPosts -- -- -- ');
    if (req.query.no) {
        debug.console('found query no is   :', parseInt(req.query.no));

        const mongo = new alib('Work', process.env.MONGOSTRING);
        mongo.setCollection('Jobs');
        let result = await mongo.find({ no: parseInt(req.query.no) });

        mongo.over();
        debug.console('result from server : ', result);
        if (result.length > 0) {

            res.json({
                status: 1,
                messag: 'data must be fetched',
                data: result[0]
            })
        } else {
            res.json({
                status: 0,
                messag: 'not found data from server',

            })
        }



    }
    else {
        res.json({
            status: 0, message: 'please provide req.query.no'
        })
    }


};

module.exports.fetchUserPosts = async (req, res) => {
    debug.console('from fetchUserPosts  -- -- --');

    const mongo = new alib('Work', process.env.MONGOSTRING);
    mongo.setCollection('Jobs');

    let result = await mongo.find({ "from": req.userData.email });

    debug.console('result from server : ', result);
    mongo.over();
    if (result.length > 0) {

        res.json({
            status: 1,
            messag: 'data must be fetched',
            data: result
        })
    }
    else {
        res.json({
            status: 0,
            messag: 'data not found',

        })
    }

};

module.exports.temp = (req, res) => {
    debug.console('from temp -  ');
    if (req.file) {

        debug.console('the req.file : ', req.file);
        res.status(200).json({
            message: 'file is found here',
            filePath: path.join(process.env.SERVER_BASE, req.file.path)
        })
        return;
    }
    else {
        res.status(404).json({
            message: 'file not recived'
        })
    }
};


module.exports.profileImg = async (req, res) => {

    debug.console('from profileImg - ');
    if (req.userData.email) {
        debug.console('found token user');

        const mongo = new alib('Work', process.env.MONGOSTRING);
        mongo.setCollection('Users');
        let response = await mongo.find({ 'userSocialData.email': req.userData.email });

        mongo.over();
        if (response.length > 0) {
            debug.console('found data from mongo', response);
            res.json({
                status: 1,
                url: '/xtServer/api' + response[0].userData.img
            })
        }
        else {
            debug.console('not found data from mongo');
            res.json({
                status: -1, message: "No Matching entry found"
            })
        }
    }
};


module.exports.userDetail = async (req, res) => {

    debug.console('from userDetail -');

    if (req.userData.email) {
        debug.console(' token email found ');
        const mongo = new alib('Work', process.env.MONGOSTRING);

        mongo.setCollection('Users');
        let result = await mongo.find({ 'userSocialData.email': req.userData.email });


        if (result.length > 0) {
            debug.console('entry found');
            res.json({
                status: 1,
                data: result[0]
            })
        }
        else {
            debug.console('no entry found');
            res.json({
                status: -1,
                message: 'no Entry found'
            })
        }
    }

};

module.exports.providerDetail = async (req, res) => {

    debug.console('from userDetail -');

    if (req.userData.email) {
        debug.console(' token email found ');
        const mongo = new alib('Work', process.env.MONGOSTRING);

        mongo.setCollection('Users');
        let result = await mongo.ag([{ $match: { 'userSocialData.email': req.userData.email } },
        { $project: { 'userData.img': 1, 'userData.name': 1 } }
        ]);


        if (result.length > 0) {
            debug.console('entry found');
            res.json({
                status: 1,
                data: result[0]
            })
        }
        else {
            debug.console('no entry found');
            res.json({
                status: -1,
                message: 'no Entry found'
            })
        }
    }

};


module.exports.userApplied = async (req, res) => {

    debug.console('from userApplied -');




    if (req.query.no && req.userData.email) {

        debug.console(' token email found ');

        mongo = new alib('Work', process.env.MONGOSTRING);
        mongo.setCollection('Jobs');

        let Applied = await mongo.ag([{ $match: { 'no': parseInt(req.query.no) } },
        { $project: { Applied: 1 } }
        ])
        await mongo.over();
        debug.console('applied : ', Applied);

        if (Applied.length > 0) {
            debug.console('the Applied data is found : ', Applied);

            res.json({
                status: 1,
                applied: Applied[0].Applied
            })
        } else {
            res.json({
                status: 0,
                message: "no data from server"
            })
        }



    }
    else {
        debug.console('no data or email found');
        res.json({
            status: -1,
            message: 'no data or email found'
        })
    }


};


module.exports.isRegistered = async (req, res) => {
    debug.console('form isRegistered -- ');


    if (req.userData) {
        debug.console('found user', req.userData.email);

        let mongo = new alib('Work', process.env.MONGOSTRING);
        mongo.setCollection('Users');

        let result = await mongo.
            find({ 'userSocialData.email': req.userData.email });

        if (result.length > 0) {
            debug.console('found result ', result);
            res.json({
                status: 1
            });
        }
        else {
            debug.console('user not registered in database');
            res.json({
                status: 0, message: "no result found"
            })
        }
    }
    else {
        debug.console('semmes not found user');
        res.status(404).json({
            status: -1, message: "not found users at the request you made"
        })
    }
};



module.exports.register = async (req, res) => {

    debug.console('From Register -');


    req.body.data = utils.jsonParseIfString(req.body.data);
    debug.console('the req.body.data : ', req.body.data);



    debug.console('the req.file : ', req.file);
    if (req.body.data) {

        let upload = {};
        upload['color'] = null;
        upload['img'] = null;

        let matchList = [
            "title", "discription", "education", "status",
            "skills", "experiance",
            "github", "email",
            "x", "name"
        ]

        req.body.data.forEach((item) => {
            if (item.index === 1) {
                upload['color'] = item.inputData.data[1].color;
            }

            matchList.forEach((match) => {

                if (item.inputData.name === match) {
                    upload[match] = item.inputData.data;
                }
            })
        })


        const mongo = new alib('Work', process.env.MONGOSTRING);
        mongo.setCollection('Users');


        let result = await mongo.insertOne({
            "Document": "user",
            "userData": {
                "status": upload.status,
                "title": upload.title,
                "description": upload.discription,
                "experiance": upload.experiance,
                "skills": upload.skills,        //make it array pending .... 
                "education": upload.education,
                "name": upload.name,
                "img": req.file ? path.join(process.env.SERVER_BASE, req.file.path) : null,
                "color": upload.color
            },
            "userSocialData": {
                "github": upload.github,
                "email": upload.email,
                "x": upload.x
            },

        });

        debug.console('result from server : ', result);


        mongo.over();
        res.json({
            status: 1,
            message: "see uploaded data, this must be uploaded ",
            data: upload
        })


        return;
    }
    else {
        res.status(404).json({
            status: 0,
            message: 'from Register'
        }).end()
        return;
    }



};

module.exports.updateUserProfile = async (req, res) => {

    debug.console('From updateUserProfile -');


    req.body.data = utils.jsonParseIfString(req.body.data);
    debug.console('the req.body.data : ', req.body.data);



    debug.console('the req.file : ', req.file);
    if (req.body.data) {

        let upload = {};
        let tempUrl = null;
        upload['color'] = null;


        let matchList = [
            "title", "discription", "education", "status",
            "skills", "experiance",
            "github", "email",
            "x", "name"
        ]

        req.body.data.forEach((item) => {
            if (item.index === 1) {
                upload['color'] = item.inputData.data[1].color;
                tempUrl = item.inputData.data[0].tempUrl;
            }

            matchList.forEach((match) => {

                if (item.inputData.name === match) {
                    upload[match] = item.inputData.data;
                }
            })
        })


        const mongo = new alib('Work', process.env.MONGOSTRING);
        mongo.setCollection('Users');

        let finalUpdate = {
            "Document": "user",
            "userData": {
                "status": upload.status,
                "title": upload.title,
                "description": upload.discription,
                "experiance": upload.experiance,
                "skills": upload.skills,
                "education": upload.education,
                "name": upload.name,
                "color": upload.color
            },
            "userSocialData": {
                "github": upload.github,
                "email": upload.email,
                "x": upload.x
            }
        }

        if (req.file) {
            finalUpdate.userData.img = path.join(process.env.SERVER_BASE, req.file.path);
            debug.console('the final update will be : ', finalUpdate);
        }
        else {
            finalUpdate.userData.img = tempUrl;
        }
        debug.console('the final update will be : ', finalUpdate);


        let result = await mongo.updateOne(
            { 'userSocialData.email': req.userData.email },
            { $set: finalUpdate }
        );

        debug.console('result from server : ', result);


        mongo.over();
        res.json({
            status: 1,
            message: "see uploaded data, this must be uploaded ",
            data: upload
        })


        return;
    }
    else {
        res.status(404).json({
            status: 0,
            message: 'from Register'
        }).end()
        return;
    }



};


module.exports.search = async (req, res) => {
    debug.console('from search controll -- -- -- ');
    debug.console('the req.body is :', req.body);

    if (req.body.data) {
        if (req.body.data.tags) {

            debug.console('founded tags here :', req.body.data.tags)

            let mongo = new alib("Work", process.env.MONGOSTRING);
            mongo.setCollection('Jobs');
            let result = await mongo.find({ "tags": { $in: req.body.data.tags } })

            if (result.length > 0) {
                debug.console('result found : ', result);

                res.json({
                    status: 1,
                    message: 'have the result enjoy',
                    data: result
                })
                return false;
            }

            debug.console("result not found");

            res.json({
                status: 0,
                message: 'result not found',

            })
        }
        else {
            debug.console('provide data.tags in body of request')
            res.json({
                status: -1,
                message: 'provide data.tags in body of request'
            })
        }
    }
};

module.exports.apply = async (req, res) => {


    debug.console('from apply()  -- -- --');


    if (req.file && req.body.data) {
        debug.console('the req.body :', req.body);
        req.body.data = utils.jsonParseIfString(req.body.data)
        debug.console("the job no is : ", req.body.data.job);
        debug.console('file found', req.file);

        let fetchUser = new alib('Work', process.env.MONGOSTRING);
        fetchUser.setCollection('Users');

        let user = await fetchUser.ag([
            { $match: { "userSocialData.email": req.userData.email } },
            { $project: { 'userData.img': 1, 'userData.name': 1 } }
        ])

        fetchUser.over();

        let finalUserData = {
            email: req.userData.email,

        }
        if (user.length > 0) {
            fetchUser.img = user[0].userData.img;
            fetchUser.name = user[0].userData.name;
        }

        let mongo = new alib('Work', process.env.MONGOSTRING);
        mongo.setCollection('Jobs');


        debug.console('the final data of user : ', finalUserData);
        let result = await mongo.updateOne({ no: req.body.data.job },
            {
                $push: {
                    Applied:
                    {
                        ...finalUserData,
                        pdfUrl: process.env.SERVER_PROTOCOL + "://" + process.env.SERVER_NAME +
                            ":" + process.env.PORT
                            + path.join(process.env.SERVER_BASE, req.file.path)
                    },
                }
            })

        mongo.over();
        if (result) {
            debug.console('found the result : ', result);
            res.json({
                status: 1,
                message: "file found, must be uploaded",
                finalUserData: finalUserData
            })
            return;
        }
        debug.console('not found the result : ', result);
        res.json({
            status: 0,
            message: "not uploaded succesfully "
        })

    } else {
        debug.console('file not found or data not found', req.file, req.body.data);
        res.json({
            status: 0,
            message: "file or data not found, must be error"
        })
    }
};

