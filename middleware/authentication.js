import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

const verifyRequest = async (req, res, next) => {
  if (req.headers && req.headers.authorization) {
    jwt.verify(req.headers.authorization, process.env.SECRET_KEY, (err, verified) => {
      if (err) {
        console.log('verifyRequest error: ', err.message);
        res.status(400).send('Token verfication failed');
      } else
        next();
    });
  } else
    res.status(400).send('Empty header');
};

export default verifyRequest;