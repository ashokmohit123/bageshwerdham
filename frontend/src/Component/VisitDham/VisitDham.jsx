import React from 'react'
import BageshwarDhamTravel from './BageshwarDhamTravel'
import BageshwarDhamVisitBanner from './BageshwarDhamVisitBanner'
import TrainRoute from './TrainRoute'
import PlaneRoute from './PlaneRoute'

const VisitDham = () => {
  return (
    <>
    <BageshwarDhamVisitBanner />
    <BageshwarDhamTravel />
    <TrainRoute />
    <PlaneRoute />
    </>
  )
}

export default VisitDham
