import { useState } from "react";
import UserProfilesAPI from "../services/UserProfilesAPI";

const Profile = (props) => {

    const [userProfile, setUserProfile] = useState(props.id)

    return (
        <section className="user-profile">
        <div className="profile-picture">
          <img src={userProfile.pp} />
        </div>
        <div className="profile-text">
          <h3>{userProfile.name}</h3>
          <h5>Currently Enjoying: {userProfile.enjoying}</h5>
          <p>{userProfile.about}</p>
        </div>
      </section>
    )
}

export default Profile;