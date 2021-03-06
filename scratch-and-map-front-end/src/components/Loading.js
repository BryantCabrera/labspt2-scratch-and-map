import React from 'react'
import { Dimmer, Loader, Segment } from 'semantic-ui-react'

const Loading = () => (
  <div>
    <div className="loading">
    <Loader size="massive" active inline='centered'><p>Loading</p></Loader>
    </div>
  </div>
)

export default Loading

