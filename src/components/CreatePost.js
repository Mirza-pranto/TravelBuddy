import Notes from './Notes';import React from 'react'

const CreatePost = (props) => {
  return (
    <div>
        <Notes showAlert={props.showAlert}/>
    </div>
  )
}

export default CreatePost
