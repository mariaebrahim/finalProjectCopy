import {dbConnection, closeConnection} from './config/mongoConnection.js';
import * as users from './data/users.js';
import * as organizerPosts from './data/organizerPosts.js';
import * as attendeePosts from './data/attendeePosts.js';

const db = await dbConnection();
await db.dropDatabase();

const anthony = await users.createUser("Anthony", "Smith", "asmith", "asmith123@gmail.com", "attendee", "9999999999", 19, "Test@123");
const israa = await users.createUser("Israa", "Ali", "iali", "iali123@gmail.com", "attendee", "1111111111", 23, "Something22!");

const fred = await users.createUser("Fred", "John", "fjohn", "fjohn123@gmail.com", "organizer", "0000000000", 47, "Imsodone$67");
const molly = await users.createUser("Molly", "Kamal", "mkamal", "mkamal123@gmail.com", "organizer", "2222222222", 34, "Imtired#13");

const anthonyPost = await attendeePosts.createPost("asmith", undefined, "I'm excited to attend the Pizza event.");
const israaPost = await attendeePosts.createPost("iali", undefined, "This event in NY is so cool.");

const fredPost = await organizerPosts.createEvent("fjohn", undefined, "Pizza", "This event will give out pizza to raise money for charity.", 1, "12:30", "2024-12-19", "New Jersey", "yes");
const mollyPost = await organizerPosts.createEvent("mkamal", undefined, "Art", "This event will feature community art.", 1, "15:00", "2024-12-22", "New Jersey", "yes");

const anthonyComment = await organizerPosts.addComment(mollyPost._id, "asmith", "This was a very delicious event.");
const anthonyRate = await organizerPosts.addComment(mollyPost._id, "asmith", 5);

const israaComment = await organizerPosts.addComment(fredPost._id, "asmith", "This was a very cool event, but maybe I'm just not the biggest fan of art.");
const israaRate = await organizerPosts.addComment(fredPost._id, "asmith", 3);

console.log('Done seeding database');
await closeConnection();