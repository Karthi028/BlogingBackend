const { default: mongoose } = require("mongoose");
const { MONGODB_URI, PORT } = require("./utils/config");
const app = require("./app");

mongoose
        .connect(MONGODB_URI)
        .then(()=>{
            console.log("Connected to Database")
            console.log("connecting to Server")

            app.listen(PORT,()=>{
                console.log("server runs on http://localhost:3000")
            })
        })
        .catch((error)=>{
            console.log("error Connecting to Database",error.message)
        })