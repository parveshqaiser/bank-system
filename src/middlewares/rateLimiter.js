
import rateLimit from "express-rate-limit";

let limiter = rateLimit({
    windowMs : 1*60*1000,
    limit : 5,
    message : {
        success : false,
        message : "too many request, please try again later"
    },
    standardHeaders: true,
    legacyHeaders : true
});

export default limiter;
