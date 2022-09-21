import express from 'express'
import axios from 'axios'
import cheerio from 'cheerio'

const PORT = process.env.PORT || 8080
const app = express()

const newspapers = [
    {
        name: 'thetimes',
        address: 'https://www.thetimes.co.uk/environment/climate-change',
        base: 'https://www.thetimes.co.uk'
    },
    {
        name: 'guardian',
        address: 'https://www.theguardian.com/environment/climate-crisis',
        base: 'https://www.theguardian.com'
    },
    {
        name: 'telegraph',
        address: 'https://www.telegraph.co.uk/climate-change',
        base: 'https://www.telegraph.co.uk'
    }
]
const articles = []

newspapers.forEach(newspaper => {
    //retrieve data from an endpoint (user side)
    axios.get(newspaper.address)
        .then(response => {
            const html = response.data
            //use cheerio to retrieve HTML element
            const $ = cheerio.load(html)

            //after loading, sort attributes of each element (format data)
            $('a:contains("climate")', html).each(function() {
               const title = $(this).text() 
                const url_part = $(this).attr("href")
                //const url = !url_part.includes("http", 0)?newspaper.base+url_part:url_part
                const url = url_part[0]=='/'?newspaper.base+url_part:url_part
                //push result in an array
                if (title && url) {                    
                    articles.push({
                        title,
                        url,
                        source: newspaper.name
                    })
                }
            })
        }).catch((err) => console.log(err))
})

app.get('/', (req, res) => {
    res.json('Welcome to the test')
})

app.get('/news', (req, res) => {
    res.json(articles)
})

app.get('/news/:newspaperID', (req, res) => {
    //get the id through the params
    const newspaperID = req.params.newspaperID  
    
    //retrieve matching the url and the base
    const newspaperAddress = newspapers.filter(newspaper => newspaper.name == newspaperID)[0].address
    const newspaperBase = newspapers.filter(newspaper => newspaper.name == newspaperID)[0].base

    axios.get(newspaperAddress)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)

            const specificArticles = []
            $('a:contains("climate")', html).each(function () {
                const title = $(this).text
                const url = $(this).attr("href")
                specificArticles.push({
                    title,
                    url: newspaperBase + url,
                    source: newspaperID
                })
            })
            res.json(specificArticles)
        }).catch(err => console.log(err))
})

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
