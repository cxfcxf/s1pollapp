
/*
 * GET home page.
 */

function checkLogin(req, res, next) {
  if (!req.session.user) {
    req.flash('error', '请先登录!'); 
    res.redirect('/login');
  }
  next();
}

function checkNotLogin(req, res, next) {
  if (req.session.user) {
    req.flash('error', '您已登录!'); 
    res.redirect('back');
  }
  next();
}

var crypto = require('crypto'),
    User = require('../models/user.js'),
    Poll = require('../models/poll.js');

module.exports = function(app) {
  app.get('/', function (req, res) {
    
    Poll.listq(function (err, pollq) {
      if (err) {
        res.render('index', { title: 'S1党争APP', polls: "error loading questions",  user: req.session.user, success: req.flash('success').toString(), error: req.flash('error').toString() });
      }
      //console.log(pollq);
      res.render('index', { title: 'S1党争APP', polls: pollq,  user: req.session.user, success: req.flash('success').toString(), error: req.flash('error').toString() });
    });

  });

  app.get('/newpoll', checkLogin);
  app.get('/newpoll', function (req, res) {
    res.render('newpoll', { title: "新党争", user: req.session.user, success: req.flash('success').toString(),
    error: req.flash('error').toString() });
  });

  app.post('/newpoll', checkLogin);
  app.post('/newpoll', function (req, res) {
    var c1 = req.body.choices.split('\r\n');
    var choicesnew = [];
    for (var el in c1) {
      if (c1[el] != "") {
        choicesnew.push({choice: c1[el], username: []});
      };
    };
    var tagarray = req.body.tags.split(',');

    console.log(tagarray);

    if (choicesnew.length <= 1) {
      req.flash('error', '投票只有一个选项, 请使用起码2个选项');
      return res.redirect('/newpoll');
    };


    var newPoll = new Poll({
      creatorname: req.session.user.username,
      question: req.body.question,
      choices: choicesnew,
      tags: tagarray
    });

    //console.log(newPoll);
    newPoll.save(function (err, poll){
      if (err) {
        req.flash('error', err);
        return res.redirect('/newpoll');
      } else {
        req.flash('success', '发布成功!');
        res.redirect('/'); //跳转到帖子
      };
    });
  });

  app.get('/viewpoll/:id', checkLogin);
  app.get('/viewpoll/:id', function (req, res) {
    var id = req.params.id;

    Poll.get(id, function (err, poll) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      };

      var choi = [];
      var uv = [];
      for ( var i=0; i<(poll.choices.length); i++) {
        choi.push({choice:poll.choices[i].choice, id:poll.choices[i]._id, username: poll.choices[i].username});
        uv.push(poll.choices[i].username);
      };
      var uservoted = []
      uservoted = uservoted.concat.apply(uservoted, uv);
      // console.log(uservoted);
      if (req.session.user) {

        if (uservoted.indexOf(req.session.user.username) != -1) {
          // voted
          // console.log(choi);
          res.render('viewpoll', { title: '投票', tags: poll.tags, id: id, qu: poll.question, uc: req.session.user.username, cn: poll.creatorname, ch: choi, vcount: uservoted.length, user: req.session.user, success: req.flash('success').toString(),
      error: req.flash('error').toString() });  

        } else {
          res.render('viewpoll', { title: '投票', tags: poll.tags, id: id, qu: poll.question, uc: req.session.user.username, cn: poll.creatorname, ch: choi, vcount: null, user: req.session.user, success: req.flash('success').toString(),
      error: req.flash('error').toString() });
        };
    };
    
    });
  });

  app.post('/viewpoll/:id', checkLogin);
  app.post('/viewpoll/:id', function (req, res) {
    //console.log(req.body.choice);
    var sid = req.body.choice,
        username = req.session.user.username,
        pid = req.params.id;

    if (req.body.tags) {
      var tags = req.body.tags.split(",");
    } else {
      var tags = "noupdate";
    }

    Poll.update(pid, sid, username, tags, function (err, poll) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/viewpoll/:id');
      };
      //console.log(poll);
      req.flash('success', "更新成功");
      res.redirect('/viewpoll/'+ pid);
    });

  });

  app.get('/delete/:id', checkLogin);
  app.get('/delete/:id', function (req, res) {
    var pid = req.params.id,
        username = req.session.user.username;

    Poll.remove(pid, username, function (err, poll) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      };
      req.flash('success', "删除成功");
      res.redirect('/');
    });
  });


  app.get('/reg', checkNotLogin);
  app.get('/reg', function (req, res) {
  	res.render('reg', { title: '注册', user: req.session.user, success: req.flash('success').toString(),
    error: req.flash('error').toString() });
  });

  app.post('/reg', checkNotLogin);
  app.post('/reg', function (req, res) {
    var password  = req.body.password,
        password_re = req.body['password-repeat'];

    if ( password_re != password) {
      req.flash('error', '两次输入密码不一致');
      return res.redirect('/reg');
    }
    var md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');
    var newUser = new User({
      username: req.body.username,
      password: password,
      email: req.body.email
    });

    // console.log(newUser);

    User.get(newUser.username, function (err, user) {
      if (user) {
        req.flash('error', '用户已存在!');
        return res.redirect('/reg');
      }

      newUser.save(function (err, user) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/reg');
        }
        req.session.user = user;
        req.flash('success', '注册成功');
        res.redirect('/');
      });
    });
  });


  app.get('/login', checkNotLogin);
  app.get('/login', function (req, res) {
  	res.render('login', { title: '登录', user: req.session.user, success: req.flash('success').toString(),
    error: req.flash('error').toString() });
  });

  app.post('/login', checkNotLogin);
  app.post('/login', function (req, res) {
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');

    User.get(req.body.username, function (err, user) {
      if (!user) {
        req.flash('error', '用户不存在');
        return res.redirect('/login');
        }
      else if (user.password != password) {
        req.flash('error', '密码错误');
        return res.redirect('/login');
        }
      else {
        req.session.user = user;
        req.flash('success', '成功登录');
        res.redirect('/');
      }
    });
  });

  app.get('/logout', function (req, res) {
    req.session.user = null;
    req.flash('success', '成功登出');
    res.redirect('/');
  });
};