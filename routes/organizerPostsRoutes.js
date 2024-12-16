import express from 'express';
import path from 'path';
import { createEvent, deletePost, updatePost, addComment, addRate } from '../data/organizerPosts.js';
import { users } from '../config/mongoCollections.js';
import { authenticateUser, authenticateOrganizer } from '../middleware.js';
import xss from 'xss';
import {ObjectId} from 'mongodb';

const router = express.Router();
const __dirname = path.resolve();

// router.get('/', async (req, res) => {
//   try {
//     const userCollection = await users();
//     const organizers = await userCollection.find({ role: 'organizer' }).toArray();
//     const allPosts = organizers.reduce((acc, organizer) => {
//       return acc.concat(organizer.posts || []);
//     }, []);
//     res.json(allPosts);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Failed to fetch posts.');
//   }
// });

router.get('/create', authenticateUser, authenticateOrganizer, (req, res) => {
  res.sendFile(path.join(__dirname, 'static/createPost.html'));
});

router.post('/create', authenticateUser, authenticateOrganizer, async (req, res) => {
  if (!req.body.eventTitle || !req.body.headCount || !req.body.time || !req.body.location || !req.body.date){
    req.session.error = 'All fields must be filled out.';
    return res.redirect('/create');
  }
  if (!req.body.description && !req.body.photo) {
    req.session.error = 'Post must include a description or photo.';
    return res.redirect('/create');
  }
  
  if(photo){
    if(!(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(req.body.photo))){
      req.session.error = 'improper photo';
      return res.redirect('/create');
    }
  }

  if(req.body.eventTitle){
    if(typeof req.body.eventTitle !== 'string' || req.body.eventTitle.trim().length < 1) {
      req.session.error = 'improper title';
      return res.redirect('/create');
    }
    req.body.eventTitle = req.body.eventTitle.trim();
  }

  if(req.body.description){
    if(typeof req.body.description !== 'string' || req.body.description.trim().length < 1) {
      req.session.error = 'improper description';
      return res.redirect('/create');
    }
    req.body.description = req.body.description.trim();
  }

  if(req.body.headCount){
    if(typeof Number(headCount) !== "number") {
      req.session.error = 'improper head count';
      return res.redirect('/create');
    }
  }

  if(req.body.time){
    //if(typeof time !== 'string') throw "imporper time";
    req.body.time = req.body.time.trim();
    //if(!(/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(time))) throw "improper time";
  }

  if(req.body.date){
    //if(typeof date !== "string") throw "improper date";
    req.body.date = req.body.date.trim();
    //if(!(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(date))) throw "improper date";
    
    //makes sure that the date is not in the past
    let dateParts = req.body.date.split("/");
    let dateNow = new Date(dateParts[2], (dateParts[0] - 1), dateParts[1]);
    let dateComp = new Date();
    if (dateNow < dateComp) {
      req.session.error = 'improper date';
      return res.redirect('/create');
    }
  }

  if(req.body.location){
    if(typeof req.body.location !== 'string' || req.body.location.trim().length < 1) {
      req.session.error = 'improper location';
      return res.redirect('/create');
    }
    req.body.location = req.body.location.trim();
  }

  if(req.body.rsvpForm){
    if(typeof req.body.rsvpForm !== 'string' || req.body.rsvpForm.trim() !== "yes" || req.body.rsvpForm.trim() !== "no") {
      req.session.error = 'improper rsvp selection';
      return res.redirect('/create');
    }
  }

  try {
    let description = xss(req.body.description);
    let eventTitle = xss(req.body.eventTitle);
    let photo = xss(req.body.photo);
    let headCount = req.body.headCount;
    let time = req.body.time;
    let date = req.body.date;
    let location = xss(req.body.location);
    let rsvpForm = req.body.rsvpForm;
    let event = await createEvent(req.session.user.username, photo, eventTitle, description, headCount, time, date, location, rsvpForm);
    res.redirect('/eventPage');
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.get('/updatePost/:id', authenticateUser, authenticateOrganizer, async (req, res) =>{
  res.sendFile(path.join(__dirname, 'static/createPost.html'));
});

router.post('/updatePost/:id', authenticateUser, authenticateOrganizer, async (req, res) =>{
  req.params.id = req.params.id.trim();
  //console.log(req.params.id);
  //validate that it is a valid object id and is non empty
  if (!req.body.eventTitle || !req.body.headCount || !req.body.time || !req.body.location || !req.body.date){
    req.session.error = 'All fields must be filled out.';
    return res.redirect(`/coordinatorProfile/${req.session.user.username}`);
  }
  if (!req.body.description && !req.body.photo) {
    req.session.error = 'Post must include a description or photo.';
    return res.redirect(`/coordinatorProfile/${req.session.user.username}`);
  }
  
  if(req.body.photo){
    if(!(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(req.body.photo))){
      req.session.error = 'improper photo';
      return res.redirect(`/coordinatorProfile/${req.session.user.username}`);
    }
  }

  if(req.body.eventTitle){
    if(typeof req.body.eventTitle !== 'string' || req.body.eventTitle.trim().length < 1) {
      req.session.error = 'improper title';
      return res.redirect(`/coordinatorProfile/${req.session.user.username}`);
    }
    req.body.eventTitle = req.body.eventTitle.trim();
  }

  if(req.body.description){
    if(typeof req.body.description !== 'string' || req.body.description.trim().length < 1) {
      req.session.error = 'improper description';
      return res.redirect(`/coordinatorProfile/${req.session.user.username}`);
    }
    req.body.description = req.body.description.trim();
  }

  if(req.body.headCount){
    if(typeof Number(headCount) !== "number") {
      req.session.error = 'improper head count';
      return res.redirect(`/coordinatorProfile/${req.session.user.username}`);
    }
  }

  if(req.body.time){
    //if(typeof time !== 'string') throw "imporper time";
    req.body.time = req.body.time.trim();
    //if(!(/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(time))) throw "improper time";
  }

  if(req.body.date){
    //if(typeof date !== "string") throw "improper date";
    req.body.date = req.body.date.trim();
    //if(!(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(date))) throw "improper date";
    
    //makes sure that the date is not in the past
    let dateParts = req.body.date.split("/");
    let dateNow = new Date(dateParts[2], (dateParts[0] - 1), dateParts[1]);
    let dateComp = new Date();
    if (dateNow < dateComp) {
      req.session.error = 'improper date';
      return res.redirect(`/coordinatorProfile/${req.session.user.username}`);
    }
  }

  if(req.body.location){
    if(typeof req.body.location !== 'string' || req.body.location.trim().length < 1) {
      req.session.error = 'improper location';
      return res.redirect(`/coordinatorProfile/${req.session.user.username}`);
    }
    req.body.location = req.body.location.trim();
  }

  if(req.body.rsvpForm){
    if(typeof req.body.rsvpForm !== 'string' || req.body.rsvpForm.trim() !== "yes" || req.body.rsvpForm.trim() !== "no") {
      req.session.error = 'improper rsvp selection';
      return res.redirect(`/coordinatorProfile/${req.session.user.username}`);
    }
  }

  let description = xss(req.body.description);
  let eventTitle = xss(req.body.eventTitle);
    let photo = xss(req.body.photo);
    let headCount = req.body.headCount;
    let time = req.body.time;
    let date = req.body.date;
    let location = xss(req.body.location);
    let rsvpForm = req.body.rsvpForm;
  try{
    let event = await updatePost(req.params.id, req.session.user.username, photo, eventTitle, description, headCount, time, date, location, rsvpForm);

    if(!event) throw "could not update post";

    res.redirect(`/coordinatorProfile/${req.session.user.username}`);

  }catch(e){
    res.redirect('/Error');
  }
});

router.get('/deletePost/:id', authenticateUser, authenticateOrganizer, async (req, res) =>{
  if(!req.params.id) {
    req.session.error = 'no id is provided.';
    return res.redirect(`/coordinatorProfile/${req.session.user.username}`);
  }
  if(typeof req.params.id !== "string") {
    req.session.error = 'id is not of proper type.';
    res.redirect(`/coordinatorProfile/${req.session.user.username}`);
  }
  req.params.id = req.params.id.trim();
  if(req.params.id === "") {
    req.session.error = 'Empty id.';
    return res.redirect(`/coordinatorProfile/${req.session.user.username}`);
  }
  if (!ObjectId.isValid(req.params.id)) {
    req.session.error = 'Invalid ObjectId.';
    return res.redirect(`/coordinatorProfile/${req.session.user.username}`);
  }
  //validate that it is a valid object id and is non empty
  try{
    let event = await deletePost(req.params.id);

    if(!event) throw "could not delete post";

    res.redirect(`/coordinatorProfile/${req.session.user.username}`);

  }catch(e){
    res.redirect('/Error');  }
});

router.get('/addComment/:id', authenticateUser, async (req, res) =>{
  if(!req.params.id) {
    req.session.error = 'no id is provided.';
    return res.redirect(`/coordinatorProfile/${req.session.user.username}`);
  }
  if(typeof req.params.id !== "string") {
    req.session.error = 'id is not of proper type.';
    res.redirect(`/coordinatorProfile/${req.session.user.username}`);
  }
  req.params.id = req.params.id.trim();
  if(req.params.id === "") {
    req.session.error = 'Empty id.';
    return res.redirect(`/coordinatorProfile/${req.session.user.username}`);
  }
  if (!ObjectId.isValid(req.params.id)) {
    req.session.error = 'Invalid ObjectId.';
    return res.redirect(`/coordinatorProfile/${req.session.user.username}`);
  }
  //validate that it is a valid object id and is non empty

  res.sendFile(path.join(__dirname, 'static/addComment.html'));
  
});

router.post('/addComment/:id', authenticateUser, async (req, res) =>{
  if(!req.params.id) {
    req.session.error = 'no id is provided.';
    return res.redirect(`/coordinatorProfile/${req.session.user.username}`);
  }
  if(typeof req.params.id !== "string") {
    req.session.error = 'id is not of proper type.';
    res.redirect(`/coordinatorProfile/${req.session.user.username}`);
  }
  req.params.id = req.params.id.trim();
  if(req.params.id === "") {
    req.session.error = 'Empty id.';
    return res.redirect(`/coordinatorProfile/${req.session.user.username}`);
  }
  if (!ObjectId.isValid(req.params.id)) {
    req.session.error = 'Invalid ObjectId.';
    return res.redirect(`/coordinatorProfile/${req.session.user.username}`);
  }
  //validate that it is a valid object id and is non empty

  let description = req.body.comment.trim();
  try{
    let comment = await addComment(req.params.id, req.session.user.username, description);

    if(!comment) throw "could not add comment";

    res.redirect('/eventPage');

  }catch(e){
    res.redirect('/Error');
  }
});

router.get('/addRate/:id', authenticateUser, async (req, res) =>{
  if(!req.params.id) {
    req.session.error = 'no id is provided.';
    return res.redirect(`/coordinatorProfile/${req.session.user.username}`);
  }
  if(typeof req.params.id !== "string") {
    req.session.error = 'id is not of proper type.';
    res.redirect(`/coordinatorProfile/${req.session.user.username}`);
  }
  req.params.id = req.params.id.trim();
  if(req.params.id === "") {
    req.session.error = 'Empty id.';
    return res.redirect(`/coordinatorProfile/${req.session.user.username}`);
  }
  if (!ObjectId.isValid(req.params.id)) {
    req.session.error = 'Invalid ObjectId.';
    return res.redirect(`/coordinatorProfile/${req.session.user.username}`);
  }
  //validate that it is a valid object id and is non empty

  res.sendFile(path.join(__dirname, 'static/addRate.html'));
  
});

router.post('/addRate/:id', authenticateUser, async (req, res) =>{
  if(!req.params.id) {
    req.session.error = 'no id is provided.';
    return res.redirect(`/coordinatorProfile/${req.session.user.username}`);
  }
  if(typeof req.params.id !== "string") {
    req.session.error = 'id is not of proper type.';
    res.redirect(`/coordinatorProfile/${req.session.user.username}`);
  }
  req.params.id = req.params.id.trim();
  if(req.params.id === "") {
    req.session.error = 'Empty id.';
    return res.redirect(`/coordinatorProfile/${req.session.user.username}`);
  }
  if (!ObjectId.isValid(req.params.id)) {
    req.session.error = 'Invalid ObjectId.';
    return res.redirect(`/coordinatorProfile/${req.session.user.username}`);
  }
  //validate that it is a valid object id and is non empty

  let rate = req.body.rate.trim();
  try{
    let rating = await addRate(req.params.id, req.session.user.username, rate);

    if(!rating) throw "could not make rating";

    res.redirect('/eventPage');

  }catch(e){
    res.redirect('/Error');
  }
});

router.get('/Error', authenticateUser, (req, res) => {
  res.sendFile(path.join(__dirname, 'static/400.html'));
});


export default router;
