import React from 'react'

const TestimonialDataSlider = ({ slides }) => {
  return (
   <>
   <section className="testimonial-section mt-5">
      <div
        id="testimonialCarousel"
        className="carousel slide carousel-fade"
        data-bs-ride="carousel"
        data-bs-interval="5000"
      >
        {/* Carousel Inner */}
        <div className="carousel-inner">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`carousel-item ${index === 0 ? "active" : ""}`}
              style={{ backgroundImage: `url(${slide.bgImage})` }}
            >
              <div className="carousel-caption">
                <h3>{slide.quote}</h3>
                <p>{slide.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Avatar Navigation */}
        <div className="avatar-nav">
          {slides.map((slide, index) => (
            <button
              key={index}
              data-bs-target="#testimonialCarousel"
              data-bs-slide-to={index}
              className={index === 0 ? "active" : ""}
              aria-label={slide.role}
            >
              <img src={slide.avatar} alt={slide.name} />
              <strong>{slide.name}</strong>
              <small>{slide.role}</small>
            </button>
          ))}
        </div>
      </div>
    </section>
   </>
  )
}

export default TestimonialDataSlider


