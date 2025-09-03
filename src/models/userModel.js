const pool= require('../config/database');

exports.findUserByEmailorUsername= async(email, username)=>{

    const query=`SELECT * FROM USERS WHERE EMAIL=$1 OR NAME=$2`;
    const values=[email, username];
    const {rows}=await pool.query(query, values);
    return rows[0] || null;

};

exports.findUserByEmail=async(email)=>{
    const query=` select * from users
    where email=$1`;
    
    const values=[email];
    const {rows}=await pool.query(query, values);
    return rows[0] || null;
};

exports.createUser= async({username, email, password_hash, role})=>{

    const query=`Insert into users (name, email, password_hash,
    role, created_at, updated_at)
    Values ($1,$2,$3,$4, Now(), Now())
    returning user_id, name, email, role, created_at`;

    const values=[username, email, password_hash,role];
    const {rows}=await pool.query(query,values);
    return rows[0];
};