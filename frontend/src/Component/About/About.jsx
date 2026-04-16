import React from 'react'
import Introduction from './Introduction'
import InspirationMillions from './InspirationMillions'
import LifeIntroduction from './LifeIntroduction'
import SantMargDershan from './SantMargDershan'
import MarqueeStrip from './MarqueeStrip'
import FeaturedGrid from './FeaturedGrid'
import AboutEvents from './AboutEvents'
import DivyaDarabar from './DivyaDarabar'
import WhatsUpSlider from './WhatsUpSlider'
import GurudevResolution from './GurudevResolution'
const About = () => {
  return (
    <div>
        <Introduction />
        <InspirationMillions />
        <LifeIntroduction />
        <AboutEvents />
        <SantMargDershan />
        <DivyaDarabar />
        <WhatsUpSlider />
        <GurudevResolution />
          <MarqueeStrip />
        <FeaturedGrid />
    </div>
  )
}

export default About
