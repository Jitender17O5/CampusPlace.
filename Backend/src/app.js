require('dotenv').config()
const path = require("path");
const express=require('express')
const app=express()
const cors=require('cors')
const studentRoutes=require('./routes/studentRoutes')
const recruiterRoutes=require('./routes/recruiterRoutes')
const applicationRoutes = require("./routes/applicationRoutes");
const jobRoutes=require('./routes/jobRoutes')
const adminRoutes = require("./routes/adminRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");
const contactRoutes = require("./routes/contactRoutes");
const passwordRoutes = require("./routes/passwordRoutes");
app.use(cors())
app.use(express.json());
app.use('/student',studentRoutes)
app.use('/recruiter',recruiterRoutes)
// Register job routes
app.use("/api/jobs", jobRoutes);
//application 
app.use("/api/applications", applicationRoutes);

app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);

app.use("/admin", adminRoutes);

app.use("/api/newsletter", newsletterRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/password", passwordRoutes);


module.exports=app