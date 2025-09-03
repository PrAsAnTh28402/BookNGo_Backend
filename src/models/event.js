module.export= (sequelize, DataTypes)=>{
    const Event= sequelize.define('Event',{
        title:{type: DataTypes.STRING, allowNull:false},
        location:{type: DataTypes.STRING, allowNull:false},
        event_date:{type: DataTypes.DATE, allowNull:false},
        description:{type: DataTypes.TEXT, allowNull:false},
        category:{type: DataTypes.STRING, allowNull:false},
        image_url:{type:DataTypes.STRING},
        is_active:{type: DataTypes.BOOLEAN, defaultValue:true}
    });

    return Event;
};