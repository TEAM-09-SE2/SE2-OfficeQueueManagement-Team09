const db = require("./connection");

async function getServingTickets(){
    const sql = `SELECT c.id AS id_counter, t.code AS ticket_code, s.name AS service_name
                FROM counters c
                LEFT JOIN tickets t ON t.id_counter = c.id AND t.status = 'SERVING'
                LEFT JOIN services s ON s.id = t.id_service;`;

    return new Promise((resolve, reject)=>{
        db.all(sql, [], (err, rows)=>{
            if(err){
                reject(err);
            }
            else{
                resolve(rows);
            }
        });
    });
}


module.exports = {getServingTickets};