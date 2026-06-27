const mongoose = require('mongoose');

module.exports = (req, res, next) => {
  const idToValidate = req.params.id || req.params.eventId;
  if (idToValidate && !mongoose.Types.ObjectId.isValid(idToValidate)) {
    return res.status(400).json({ msg: 'Invalid ID format' });
  }
  next();
};
