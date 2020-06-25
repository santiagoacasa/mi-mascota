const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require("../models/User.model");
const Pet = require("../models/Pet.model");
const Appointment = require("../models/Appointment.model");

router.get("/user-profile", async (req, res, next) => {
  try {
    const myPets = await Pet.find({ owner: req.session.currentUser._id });
    const appointments = await Appointment.find({owner: req.session.currentUser._id}).populate("pet");
    res.render("user/profile", {
      userInSession: req.session.currentUser,
      myPets: myPets,
      petAppointments: appointments
    });
  } catch (e) {
    next(e);
  }
});

router.get("/edit/user-profile", (req, res, next) => {
  try{
    res.render("user/editProfile", {userInSession: req.session.currentUser});
  } catch (e) {
    next(e);
  }
})

router.post("/edit/user-profile", async (req, res, next) => {
  try{ 
    const {
      _id: userId
    } = req.session.currentUser
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, {new: true});
    req.session.currentUser = updatedUser;
    res.redirect("/user-profile");
  } catch (e) {
    next(e);
  }
})

router.post("/edit/pwd", async (req, res, next) => {
  try {  
    const {_id: userId} = req.session.currentUser
    console.log(userId)
    const {newPassword, oldPassword} = req.body
    if (newPassword) {
      const updatePassword = await updatePasswordHandler(newPassword, oldPassword, userId)
      res.redirect("/user-profile");
    }
  } catch(err) {
    next(err)
  }
})

const updatePasswordHandler = async (newPassword, oldPassword, userId) => {
  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const {passwordHash} = await User.findById({_id: userId});
    const verifyPass = await bcrypt.compare(oldPassword, passwordHash);
    console.log(verifyPass)
    if (verifyPass) {
      const hashNewPassword = await bcrypt.hash(newPassword, salt)
      const updatedUser = await User.findByIdAndUpdate(userId, {passwordHash: hashNewPassword}, {new: true});
      return updateUser
    }
  } catch (err) {
   console.log(err)
    return err
  }
}

module.exports = router;
