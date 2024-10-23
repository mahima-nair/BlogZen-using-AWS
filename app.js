require('dotenv').config();

const aws = require('aws-sdk');
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
app.set('view engine', 'ejs'); // Set EJS as the templating engine
// app.set('views', './views'); // Set the views directory (optional if in default location)

app.use(express.urlencoded({extended:true}));
app.use(express.json());

let awsConfig = {
    "region":process.env.AWS_REGION,
    "endpoint": "https://dynamodb.eu-north-1.amazonaws.com",
    "accessKeyId":process.env.AWS_ACCESS_KEY_ID,
    "secretAccessKey":process.env.AWS_SECRET_ACCESS_KEY
};

aws.config.update(awsConfig);
const docClient = new aws.DynamoDB.DocumentClient();

app.use(express.static("public"));

// Homepage Route - Fetch all items
app.get('/', async (req, res) => {
    try{
                const locals = {
            title: "NodeJS Blog",
            description: "Lorem epsum",
    
        }
        const params = {
            TableName: 'blog'
        };
    
        docClient.scan(params, (err, data) => {
            if (err) {
                console.error('Unable to scan the table. Error:', JSON.stringify(err, null, 2));
                res.status(500).send('Unable to fetch posts');
            } else {
                res.render("index.ejs",{data: data.Items});
            }
        });
      
        }
        catch(error){
            console.log(error);
    
        }
   
});

app.get("/blogpost/:title", async(req,res)=>{

    try{
        const slug = req.params.title;
        const params = {

            TableName: 'blog',  // Replace with your table name
            Key: {
                title: slug // Replace with your primary key attribute name and value
            }
        };
  
       // Use a promise to handle the async get call
       const data = await docClient.get(params).promise();
       if (data.Item) {
        console.log("Get item succeeded:", JSON.stringify(data.Item, null, 2));

        const locals = {
            title: data.Item.title, // Use the title from the retrieved item
            
        };
      
        res.render('blog', { data: data.Item, locals });
    } else {
        console.log("No item found with the specified title.");
        res.status(404).send("Post not found."); // Send a 404 response if not found
    }
} catch (err) {
    console.error("Unable to get item. Error JSON:", JSON.stringify(err, null, 2));
    res.status(500).send("Internal server error."); // Handle errors gracefully
}
});

//Search Route
app.post("/search",async (req,res)=>{
    
    try{
    const locals = {
            title: "Search",
    
    }
    let searchTerm = re.body.searchInput;
    const searchNoSpeacialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "");
    const data = await Post.find({
        $or: [
            {title: {
                $regex : new RegExp(searchNoSpeacialChar, 'i')}}        ]
    });

    res.render("search.ejs",{
        data,
        locals
    });
    }
    catch(error){
        console.log(error);
    }

});

//add new post
app.get("/addNew", (req,res)=>{

    res.render("add.ejs");
});

app.post("/addNew", async (req, res) => {
    var date = new Date();
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = date.getFullYear();
    date = mm + '/' + dd + '/' + yyyy;
    const { title, author, body } = req.body;
    

    // Create a new entry object. Add other fields if necessary.
    const newEntry = {
        title: title,
        author: author,
        body: body,
        dateCreated: date
    };

    const params = {
        TableName: 'blog', // Replace with your DynamoDB table name
        Item: newEntry
    };

    try {
        // Insert the new entry into DynamoDB
        await docClient.put(params).promise();
        console.log(`New entry created:`, newEntry);
        
        // Redirect to the homepage or wherever you want
        res.redirect("/"); // Redirect or send a success message
    } catch (error) {
        console.error('Error inserting entry:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get("/edit/:title", async (req,res)=>{
    try{
        const slug = decodeURIComponent(req.params.title);
        const params = {

            TableName: 'blog',  // Replace with your table name
            Key: {
                title: slug // Replace with your primary key attribute name and value
            }
        };
  
       // Use a promise to handle the async get call
       const data = await docClient.get(params).promise();
       if (data.Item) {
        //console.log("Get item succeeded:", JSON.stringify(data.Item, null, 2));

        const locals = {
            title: data.Item.title, // Use the title from the retrieved item
            
        };
      
        res.render('edit', { data: data.Item, locals });
    } else {
        //console.log("No item found with the specified title.");
        res.status(404).send("Post not found."); // Send a 404 response if not found
    }
} catch (err) {
    console.error("Unable to get item. Error JSON:", JSON.stringify(err, null, 2));
    res.status(500).send("Internal server error."); // Handle errors gracefully
}
});

app.post("/edit/:title", async(req,res)=>{
        const slug = decodeURIComponent(req.params.title)
        const { author, body } = req.body;
        var date = new Date();
        var dd = String(date.getDate()).padStart(2, '0');
        var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = date.getFullYear();
        date = mm + '/' + dd + '/' + yyyy;
    
        const params = {
            TableName: 'blog', // Your DynamoDB table name
            Item: {
                title:slug,
                author: author,
                body: body,
                dateCreated: date // Update as needed
            }
        };
    
        try {
            await docClient.put(params).promise();
            console.log(`Post updated:`, { id: slug, author, body });
    
            res.redirect("/"); // Redirect after successful update
        } catch (error) {
            console.error('Error updating post:', error);
            res.status(500).send("Internal Server Error");
        }
    });

    app.post("/delete/:title", async (req, res) => {
        const title = req.params.title; // Use 'title' instead of 'id'
        
        const params = {
            TableName: 'blog', // Your DynamoDB table name
            Key: {
                title: title // Using title as the primary key
            }
        };
    
        try {
            // Delete the item from DynamoDB
            await docClient.delete(params).promise();
            console.log(`Post deleted with title: ${title}`);
            
            // Redirect to the homepage or send a success message
            res.redirect("/"); // Redirect after deletion
        } catch (error) {
            console.error('Error deleting post:', error);
            res.status(500).send("Internal Server Error");
        }
    });
    
    


//Admin Login Page
// app.get("/admin", async(req,res)=>{
//     try{
//         const locals = {
//                 title: "Admin",
        
//         }
//         let searchTerm = re.body.searchInput;
//         const searchNoSpeacialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "");
//         const data = await Post.find({
//             $or: [
//                 {title: {
//                     $regex : new RegExp(searchNoSpeacialChar, 'i')}}        ]
//         });
    
//         res.render("admin.ejs",{
//             data,
//             locals
//         });
//         }
//         catch(error){
//             console.log(error);
//         }

// });
app.listen(port, ()=>{
    console.log(`App listening in port ${port}`);

});




function insertPostData(){
    Post.insertMany([
        {
            title:"Building a Blog using MongoDB",
            author: "ABC",
            body: "This is the body text."
        },
        {
            title:"Building 2nd Blog using MongoDB",
            author: "XYZ",
            body: "This is the body text."
        }
    ])
}

 //insertPostData();

