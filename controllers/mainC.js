exports.getIndex = (req, res, next) => {
  res.render('main/index', { pageTitle: 'Chat App' });
};

exports.getChat = (req, res, next) => {
  res.render('main/chat', { pageTitle: 'Chat!' });
};
