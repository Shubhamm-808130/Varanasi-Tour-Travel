// Varanasi Tour & Travel Client Logic

document.addEventListener('DOMContentLoaded', function () {
  // 1. CAR BOOKING FARE CALCULATOR
  const vehicleSelect = document.getElementById('vehicleSelect');
  const tripTypeInputs = document.querySelectorAll('input[name="trip_type"]');
  const attractionCheckboxes = document.querySelectorAll('.attraction-check');
  const calculatedDistanceEl = document.getElementById('calculatedDistance');
  const estimatedFareEl = document.getElementById('estimatedFare');
  const totalAmountInput = document.getElementById('totalAmountInput');

  function calculateFare() {
    if (!vehicleSelect || !estimatedFareEl) return;

    const selectedOption = vehicleSelect.options[vehicleSelect.selectedIndex];
    if (!selectedOption || !selectedOption.dataset.baseRate) return;

    const baseRate = parseFloat(selectedOption.dataset.baseRate) || 2200;
    const perKmRate = parseFloat(selectedOption.dataset.perKm) || 12;
    const airportRate = parseFloat(selectedOption.dataset.airportRate) || 1100;

    let selectedTripType = 'local';
    tripTypeInputs.forEach(input => {
      if (input.checked) selectedTripType = input.value;
    });

    let totalFare = 0;
    let totalKm = 80; // default for local 8hr/80km

    if (selectedTripType === 'airport') {
      totalFare = airportRate;
      totalKm = 26; // Varanasi Babatpur airport distance
      if (calculatedDistanceEl) calculatedDistanceEl.innerText = `${totalKm} km (Airport Transfer)`;
    } else if (selectedTripType === 'outstation') {
      // Base calculation for outstation minimum 250km per day
      totalKm = 250;
      totalFare = totalKm * perKmRate;
      if (calculatedDistanceEl) calculatedDistanceEl.innerText = `${totalKm} km (Min 250 km/day)`;
    } else {
      // Local Sightseeing: Base rate covers 8hr / 80km
      totalFare = baseRate;
      let extraKm = 0;
      let selectedPlacesCount = 0;

      attractionCheckboxes.forEach(cb => {
        if (cb.checked) {
          selectedPlacesCount++;
          const dist = parseFloat(cb.dataset.distance) || 0;
          extraKm += dist;
        }
      });

      // If selected places exceed 80 km round-trip
      const estimatedTourKm = Math.max(80, Math.round(extraKm * 1.5 + 20));
      if (estimatedTourKm > 80) {
        totalFare += (estimatedTourKm - 80) * perKmRate;
      }

      if (calculatedDistanceEl) {
        calculatedDistanceEl.innerText = `${estimatedTourKm} km (${selectedPlacesCount} places selected)`;
      }
    }

    // Optional Hotel Combo Add-on
    const includeHotelCheck = document.getElementById('includeHotelCheck');
    const comboHotelSelect = document.getElementById('comboHotelSelect');
    const comboHotelNights = document.getElementById('comboHotelNights');
    const comboHotelFields = document.getElementById('comboHotelFields');
    const hotelFareBreakdown = document.getElementById('hotelFareBreakdown');
    const hotelFareCost = document.getElementById('hotelFareCost');

    if (includeHotelCheck && includeHotelCheck.checked && comboHotelSelect) {
      if (comboHotelFields) comboHotelFields.style.display = 'flex';
      const selectedHotelOption = comboHotelSelect.options[comboHotelSelect.selectedIndex];
      const hotelRate = selectedHotelOption ? (parseFloat(selectedHotelOption.dataset.price) || 0) : 0;
      const nights = comboHotelNights ? (parseInt(comboHotelNights.value) || 1) : 1;
      const hotelTotal = hotelRate * nights;
      totalFare += hotelTotal;

      if (hotelFareBreakdown && hotelFareCost) {
        hotelFareBreakdown.style.display = 'flex';
        hotelFareCost.innerText = `+₹${hotelTotal.toLocaleString('en-IN')} (${nights}N)`;
      }
    } else {
      if (comboHotelFields) comboHotelFields.style.display = 'none';
      if (hotelFareBreakdown) hotelFareBreakdown.style.display = 'none';
    }

    estimatedFareEl.innerText = `₹${Math.round(totalFare).toLocaleString('en-IN')}`;
    if (totalAmountInput) {
      totalAmountInput.value = Math.round(totalFare);
    }
  }

  if (vehicleSelect) {
    vehicleSelect.addEventListener('change', calculateFare);
  }
  tripTypeInputs.forEach(input => {
    input.addEventListener('change', function () {
      const placesSection = document.getElementById('sightseeingPlacesSection');
      if (placesSection) {
        if (this.value === 'local') {
          placesSection.style.display = 'block';
        } else {
          placesSection.style.display = 'none';
        }
      }
      calculateFare();
    });
  });
  attractionCheckboxes.forEach(cb => {
    cb.addEventListener('change', calculateFare);
  });

  const includeHotelCheckEl = document.getElementById('includeHotelCheck');
  const comboHotelSelectEl = document.getElementById('comboHotelSelect');
  const comboHotelNightsEl = document.getElementById('comboHotelNights');

  if (includeHotelCheckEl) {
    includeHotelCheckEl.addEventListener('change', calculateFare);
  }
  if (comboHotelSelectEl) {
    comboHotelSelectEl.addEventListener('change', calculateFare);
  }
  if (comboHotelNightsEl) {
    comboHotelNightsEl.addEventListener('input', calculateFare);
  }

  // Run initial calculation
  calculateFare();

  // 2. ATTRACTIONS FILTERING (Categories & Search)
  const filterButtons = document.querySelectorAll('.filter-btn');
  const attractionCards = document.querySelectorAll('.attraction-item-card');
  const searchInput = document.getElementById('attractionSearch');

  function filterAttractions() {
    const activeCategory = document.querySelector('.filter-btn.active')?.dataset.category || 'all';
    const searchText = (searchInput ? searchInput.value : '').toLowerCase().trim();

    attractionCards.forEach(card => {
      const cardCategory = (card.dataset.category || '').toLowerCase();
      const cardName = (card.dataset.name || '').toLowerCase();
      const cardDesc = (card.dataset.description || '').toLowerCase();

      const matchesCategory = (activeCategory === 'all' || cardCategory === activeCategory.toLowerCase());
      const matchesSearch = (!searchText || cardName.includes(searchText) || cardDesc.includes(searchText));

      if (matchesCategory && matchesSearch) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  filterButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      filterButtons.forEach(b => b.classList.remove('active', 'btn-primary-kashi'));
      filterButtons.forEach(b => b.classList.add('btn-outline-secondary'));
      this.classList.remove('btn-outline-secondary');
      this.classList.add('active', 'btn-primary-kashi');
      filterAttractions();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', filterAttractions);
  }

  // 3. SET DEFAULT SERVICE DATE (Tomorrow)
  const serviceDateInput = document.getElementById('serviceDate');
  if (serviceDateInput && !serviceDateInput.value) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    serviceDateInput.value = tomorrow.toISOString().split('T')[0];
    serviceDateInput.min = new Date().toISOString().split('T')[0];
  }

  // 4. HERO BACKGROUND MULTI-IMAGE SLIDER (Auto-slides every 4.5s)
  const heroSlides = document.querySelectorAll('.hero-slide');
  const sliderDots = document.querySelectorAll('.hero-slider-dot');
  let currentSlideIndex = 0;
  let slideInterval = null;

  function showSlide(index) {
    if (!heroSlides.length) return;
    heroSlides.forEach((slide, i) => {
      slide.classList.remove('active');
      if (sliderDots[i]) sliderDots[i].classList.remove('active');
    });
    currentSlideIndex = (index + heroSlides.length) % heroSlides.length;
    heroSlides[currentSlideIndex].classList.add('active');
    if (sliderDots[currentSlideIndex]) {
      sliderDots[currentSlideIndex].classList.add('active');
    }
  }

  function startSlideTimer() {
    if (!heroSlides.length) return;
    slideInterval = setInterval(() => {
      showSlide(currentSlideIndex + 1);
    }, 4500);
  }

  sliderDots.forEach(dot => {
    dot.addEventListener('click', function () {
      clearInterval(slideInterval);
      const targetIndex = parseInt(this.dataset.index, 10);
      showSlide(targetIndex);
      startSlideTimer();
    });
  });

  startSlideTimer();

  // 5. CAB TARIFF CATEGORY FILTER (On Cab Section)
  const cabFilterBtns = document.querySelectorAll('.cab-filter-btn');
  const cabCardItems = document.querySelectorAll('.cab-card-item');

  cabFilterBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      cabFilterBtns.forEach(b => {
        b.classList.remove('active', 'btn-primary-kashi');
        b.classList.add('btn-outline-secondary');
      });
      this.classList.remove('btn-outline-secondary');
      this.classList.add('active', 'btn-primary-kashi');

      const filter = this.dataset.cabFilter;
      cabCardItems.forEach(card => {
        const cat = card.dataset.category || '';
        if (filter === 'all' || cat.toLowerCase().includes(filter.toLowerCase()) || filter.toLowerCase().includes(cat.toLowerCase())) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 6. LIGHTWEIGHT SCROLL-REVEAL ANIMATION (Zero External Dependencies)
  if ('IntersectionObserver' in window) {
    const revealTargets = document.querySelectorAll('section:not(.hero-section), .custom-card, .fleet-card');
    revealTargets.forEach(el => el.classList.add('reveal-on-scroll'));

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    revealTargets.forEach(el => revealObserver.observe(el));
  }
});


