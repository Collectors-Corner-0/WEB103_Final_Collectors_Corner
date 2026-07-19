import { useState } from "react";

const MediaCard = ({media}) => {

    const calculateHearts = () => {
        if (media.rating == 0) {
            return '✘'
        }

        let hearts = '';
        for (let i = 0; i < media.rating; i++) {
            hearts += '⁠❤︎' // ❤️
        }

        return hearts
    }

    return(
        <div className="media-card">
            <div className="media-img">
                <img src={media.mediaImg} />
            </div>
            <div className="media-text">
                <p className="hearts">{calculateHearts()}</p>
                {/* <p>{media.rating}</p> */}
                <p><i>{media.title}</i> by {media.creator}</p>
            </div>
        </div>
    )
}

export default MediaCard;