const axios = require('axios');

axios.get('http://192.168.0.87:9200/test/_search', {
    query: {
        range : {
            timestamp : {
                gte : "now-1m"
            }
        }
    }
})
.then((rs)=>{
    console.log(rs.data.hits);
});