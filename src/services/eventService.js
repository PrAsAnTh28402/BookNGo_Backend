const {getEventByTitleAndDate, createEvent}=require('../models/eventModel');

exports.createEventService=async(eventData)=>{
    const existingEvent=await getEventByTitleAndDate(eventData.title, eventData.event_date);
    if(existingEvent){
        throw{status:409, message:"Event Already exists"};
    }


    const newEvent=await createEvent(eventData);

    return{
        event_id:newEvent.event_id,
        title:newEvent.title,
        location:newEvent.location,     
        event_date:newEvent.event_date,
        time:newEvent.time, 
        description:newEvent.description,
        category_id:newEvent.category_id,   
        image_url:newEvent.image_url,
        capacity:newEvent.capacity,
        available_seats:newEvent.available_seats,
        price:newEvent.price,
        created_by:newEvent.created_by,
        created_at:newEvent.created_at,
        updated_at:newEvent.updated_at
    };
    
}