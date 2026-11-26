const db = require('./db');

const seedData = async () => {
  // Wait for schema init
  await db.initSchema();

  // Check if attractions already exist
  const existingAttractions = await db.all('SELECT COUNT(*) as count FROM attractions');
  if (existingAttractions[0].count === 0) {
    console.log('Seeding attractions...');
    const attractions = [
      {
        name: 'Kashi Vishwanath Temple & Corridor',
        hindi_name: 'श्री काशी विश्वनाथ मंदिर',
        category: 'Temple',
        distance_km: 4.5,
        travel_time: '20 mins',
        entry_fee: 0,
        timings: '03:00 AM - 11:00 PM (Mangala Aarti 3:00 AM)',
        best_time: 'Early morning (5:00 AM - 7:00 AM) or after 8:00 PM',
        description: 'One of the twelve sacred Jyotirlingas of Lord Shiva. The newly developed Grand Corridor connects the temple directly with the sacred Ganga River.',
        highlights: 'Golden Spire, Gyanvapi Well, Direct Ghat Corridor, Mangala & Shringaar Aarti',
        image_url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
        location: 'Lahori Tola, Varanasi'
      },
      {
        name: 'Dashashwamedh Ghat (Grand Evening Aarti)',
        hindi_name: 'दशाश्वमेध घाट (गंगा आरती)',
        category: 'Ghat',
        distance_km: 4.2,
        travel_time: '18 mins',
        entry_fee: 0,
        timings: 'Open 24 hours (Evening Aarti starts ~6:30 PM)',
        best_time: '5:30 PM to 8:00 PM for viewing Aarti from stairs or boat',
        description: 'The main and most vibrant ghat on the Ganges in Varanasi. Every evening, high priests perform the mesmerizing Maha Aarti with brass lamps and devotional chants.',
        highlights: 'Spectacular Maha Aarti, Boat Rides, Holy Dip, Vibrant Bazaar',
        image_url: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80',
        location: 'Dashashwamedh Ghat Road, Varanasi'
      },
      {
        name: 'Assi Ghat (Subah-e-Banaras)',
        hindi_name: 'अस्सी घाट (सुबह-ए-बनारस)',
        category: 'Ghat',
        distance_km: 6.0,
        travel_time: '25 mins',
        entry_fee: 0,
        timings: 'Open 24 hours (Subah-e-Banaras 5:00 AM)',
        best_time: 'Dawn 5:00 AM - 7:00 AM for sunrise & classical music',
        description: 'Located at the southern confluence of the Ganga and Assi rivers. Renowned for "Subah-e-Banaras" featuring morning Vedic chants, yoga, and classical music performances.',
        highlights: 'Morning Aarti, Sunrise Boat Rides, Yoga on Ghat, Cozy Cafes',
        image_url: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
        location: 'Southern end of Ghats, Assi, Varanasi'
      },
      {
        name: 'Manikarnika Ghat (Mahashamshan)',
        hindi_name: 'मणिकर्णिका घाट (महाश्मशान)',
        category: 'Ghat',
        distance_km: 4.8,
        travel_time: '22 mins',
        entry_fee: 0,
        timings: 'Open 24 hours',
        best_time: 'During daytime boat ride along the Ganges',
        description: 'The primary cremation ghat in Hinduism where the sacred fire has burned continuously for thousands of years. It is believed that cremation here grants direct Moksha (liberation).',
        highlights: 'Chakra-Pushkarini Kunda, Ancient Shiva Temple, Spiritual liberation significance',
        image_url: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80',
        location: 'Near Scindia Ghat, Varanasi'
      },
      {
        name: 'Sarnath Buddhist Heritage & Dhamek Stupa',
        hindi_name: 'सारनाथ बौद्ध तीर्थ एवं धमेख स्तूप',
        category: 'Excursion',
        distance_km: 10.5,
        travel_time: '35 mins',
        entry_fee: 25,
        timings: '06:00 AM - 06:00 PM (Museum closed on Fridays)',
        best_time: 'Morning 8:00 AM - 11:00 AM or afternoon 3:00 PM - 5:30 PM',
        description: 'Where Lord Buddha delivered his first sermon (Dhammacakkappavattana Sutta) after attaining enlightenment. Home to Ashoka Pillar, archaeological museum, and serene monasteries.',
        highlights: 'Dhamek Stupa, Ashoka Lion Capital Museum, Chaukhandi Stupa, Thai Temple',
        image_url: 'https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&w=800&q=80',
        location: 'Sarnath, Varanasi (10 km North-East)'
      },
      {
        name: 'Ramnagar Fort & Museum',
        hindi_name: 'रामनगर किला एवं संग्रहालय',
        category: 'Heritage',
        distance_km: 14.0,
        travel_time: '40 mins',
        entry_fee: 50,
        timings: '10:00 AM - 05:00 PM',
        best_time: 'Winter afternoons or around sunset',
        description: 'An 18th-century sandstone fortress built on the eastern bank of River Ganga by Kashi Naresh. Features an eccentric vintage museum of royal cars, armory, and medieval astronomical clocks.',
        highlights: 'Royal Vintage Car Collection, Rare Armory, Ganga View Balconies, Famous Lassi shops outside',
        image_url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
        location: 'Ramnagar, Varanasi (Across River Ganga)'
      },
      {
        name: 'Sankat Mochan Hanuman Temple',
        hindi_name: 'संकट मोचन हनुमान मंदिर',
        category: 'Temple',
        distance_km: 6.5,
        travel_time: '25 mins',
        entry_fee: 0,
        timings: '05:00 AM - 12:00 PM & 04:00 PM - 10:00 PM',
        best_time: 'Tuesday and Saturday evening for special darshan',
        description: 'Founded by Saint Goswami Tulsidas. Millions visit to pray for removal of troubles (Sankat). Famous for its special besan laddoos and calm spiritual garden atmosphere.',
        highlights: 'Founded by Tulsidas, Besan Laddoo Prasad, Classical Music Festival venue',
        image_url: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80',
        location: 'Sankat Mochan Road, Saket Nagar, Varanasi'
      },
      {
        name: 'Kaal Bhairav Temple (Kotwal of Varanasi)',
        hindi_name: 'काल भैरव मंदिर (काशी के कोतवाल)',
        category: 'Temple',
        distance_km: 3.8,
        travel_time: '15 mins',
        entry_fee: 0,
        timings: '05:00 AM - 01:30 PM & 04:30 PM - 10:00 PM',
        best_time: 'Morning 7:00 AM - 9:00 AM',
        description: 'Dedicated to Kaal Bhairav, the fierce manifestation of Shiva considered the guardian deity (Kotwal) of Kashi. Pilgrims traditionally seek his permission before visiting Vishwanath.',
        highlights: 'Guardian of Kashi, Holy Black Thread (Ganda), Mustard oil lamp offering',
        image_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
        location: 'Visheshwarganj, Varanasi'
      },
      {
        name: 'New Vishwanath Temple (BHU VT)',
        hindi_name: 'नया विश्वनाथ मंदिर (बीएचयू)',
        category: 'Temple',
        distance_km: 7.2,
        travel_time: '25 mins',
        entry_fee: 0,
        timings: '04:00 AM - 12:00 PM & 01:00 PM - 09:00 PM',
        best_time: 'Late afternoon 4:00 PM - 6:30 PM',
        description: 'Built by the Birla family inside the lush green Banaras Hindu University (BHU) campus. Has the tallest temple spire (Shikhara) in the world, carved in white marble.',
        highlights: 'Tallest Temple Tower (77 meters), Marble Gita carvings, Peaceful green BHU campus',
        image_url: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
        location: 'Banaras Hindu University Campus, Varanasi'
      },
      {
        name: 'Tulsi Manas Mandir',
        hindi_name: 'तुलसी मानस मंदिर',
        category: 'Temple',
        distance_km: 6.2,
        travel_time: '22 mins',
        entry_fee: 0,
        timings: '05:30 AM - 12:00 PM & 04:00 PM - 09:00 PM',
        best_time: 'Evening 5:00 PM - 7:30 PM',
        description: 'White marble temple standing at the exact place where Goswami Tulsidas wrote the Ramcharitmanas. The entire epic Ramayana is engraved on marble walls with mechanical puppets.',
        highlights: 'Engraved Ramcharitmanas verses, Animated puppet shows, Marble architecture',
        image_url: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=800&q=80',
        location: 'Near Durga Kund, Varanasi'
      },
      {
        name: 'Durga Kund Mandir',
        hindi_name: 'दुर्गा कुण्ड मंदिर (लाल मंदिर)',
        category: 'Temple',
        distance_km: 6.0,
        travel_time: '20 mins',
        entry_fee: 0,
        timings: '05:00 AM - 11:00 PM',
        best_time: 'Navratri or Tuesday/Friday morning',
        description: '18th-century red-painted Nagara architecture temple built by Rani Bhabani of Bengal. Houses an ancient freshwater sacred kund adjacent to the temple.',
        highlights: 'Red Ochre Architecture, Sacred Kund, Powerful Shakti Peeth energy',
        image_url: 'https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?auto=format&fit=crop&w=800&q=80',
        location: 'Durga Kund Road, Jawahar Nagar, Varanasi'
      }
    ];

    for (const place of attractions) {
      await db.run(
        `INSERT INTO attractions (name, hindi_name, category, distance_km, travel_time, entry_fee, timings, best_time, description, highlights, image_url, location)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [place.name, place.hindi_name, place.category, place.distance_km, place.travel_time, place.entry_fee, place.timings, place.best_time, place.description, place.highlights, place.image_url, place.location]
      );
    }
  }

  // Check if vehicles already exist
  const existingVehicles = await db.all('SELECT COUNT(*) as count FROM vehicles');
  if (existingVehicles[0].count === 0) {
    console.log('Seeding vehicles fleet...');
    const vehicles = [
      {
        name: 'Maruti Suzuki Dzire / Toyota Etios',
        category: 'Sedan',
        capacity: 4,
        luggage_capacity: 2,
        ac: 1,
        local_base_rate: 2200, // 8hr/80km
        outstation_rate_per_km: 12,
        airport_transfer_rate: 1100,
        image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
        features: '4 Passengers, AC, Clean Interior, Bottled Water, Punctual Driver'
      },
      {
        name: 'Maruti Suzuki Ertiga (Spacious 6-Seater)',
        category: 'SUV / MUV',
        capacity: 6,
        luggage_capacity: 4,
        ac: 1,
        local_base_rate: 3000, // 8hr/80km
        outstation_rate_per_km: 15,
        airport_transfer_rate: 1500,
        image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
        features: '6 Passengers, Dual AC, Foldable Seats, Family Favorite, Audio System'
      },
      {
        name: 'Toyota Innova Crysta (Luxury & Comfort)',
        category: 'Premium SUV',
        capacity: 7,
        luggage_capacity: 5,
        ac: 1,
        local_base_rate: 4200, // 8hr/80km
        outstation_rate_per_km: 19,
        airport_transfer_rate: 2200,
        image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
        features: '7 Passengers, Captain Seats, Pushback Recline, Premium Sound, Highway King'
      },
      {
        name: 'Force Tempo Traveller (12 / 17 Seater)',
        category: 'Group Van',
        capacity: 14,
        luggage_capacity: 10,
        ac: 1,
        local_base_rate: 5800, // 8hr/80km
        outstation_rate_per_km: 26,
        airport_transfer_rate: 3500,
        image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
        features: 'Large Pilgrimage Groups, Individual AC Vents, High Roof, Ample Luggage Space'
      }
    ];

    for (const v of vehicles) {
      await db.run(
        `INSERT INTO vehicles (name, category, capacity, luggage_capacity, ac, local_base_rate, outstation_rate_per_km, airport_transfer_rate, image_url, features)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [v.name, v.category, v.capacity, v.luggage_capacity, v.ac, v.local_base_rate, v.outstation_rate_per_km, v.airport_transfer_rate, v.image_url, v.features]
      );
    }
  }

  // Check if packages already exist
  const existingPackages = await db.all('SELECT COUNT(*) as count FROM packages');
  if (existingPackages[0].count === 0) {
    console.log('Seeding tour packages...');
    const packages = [
      {
        title: 'Kashi Darshan Same-Day Temple Tour',
        subtitle: 'Visit all prominent shrines of Lord Shiva and sacred Kashi ghats in 1 full day',
        duration: '1 Day (8 to 9 Hours)',
        price: 2499,
        original_price: 3200,
        image_url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
        badge: 'Best Seller',
        highlights: 'Kashi Vishwanath Corridor, Kaal Bhairav, Sankat Mochan, BHU New Vishwanath, Tulsi Manas, Durga Kund, Dashashwamedh Evening Aarti',
        itinerary: '08:00 AM Hotel Pickup -> 08:30 AM Kashi Vishwanath Darshan -> 11:00 AM Kaal Bhairav -> 01:00 PM Lunch Break -> 02:30 PM Sankat Mochan & Durga Kund -> 04:30 PM BHU Temple -> 06:00 PM Dashashwamedh Ghat for Evening Aarti -> 08:00 PM Hotel Drop',
        inclusions: 'Dedicated AC Sedan/SUV Cab, Punctual Driver, Fuel & Toll Charges, Parking Fees',
        exclusions: 'Temple VIP Darshan tickets, Boat ride ticket, Personal meals'
      },
      {
        title: 'Subah-e-Banaras Sunrise Boat Tour & Ganga Aarti',
        subtitle: 'Witness the mystical dawn on the Ganges with morning Vedic chants followed by evening Grand Aarti',
        duration: 'Same Day (Morning & Evening sessions)',
        price: 1899,
        original_price: 2500,
        image_url: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
        badge: 'Top Rated',
        highlights: 'Assi Ghat Subah-e-Banaras, Morning Sunrise Boat Ride across 84 Ghats, Manikarnika view, Dashashwamedh Maha Aarti reserved boat seat',
        itinerary: '05:00 AM Pickup -> 05:30 AM Assi Ghat Sunrise & Vedic Yoga -> 06:15 AM Private Row/Motor Boat across 84 Ghats -> 08:30 AM Drop back for Breakfast. 05:30 PM Evening Pickup -> 06:15 PM Dashashwamedh Ghat Aarti viewing from Boat -> 08:00 PM Drop',
        inclusions: 'Morning & Evening AC Cab transfers, Private/Shared Ganges Boat Ride, Life Jackets, Guide assistance',
        exclusions: 'Camera fees, Snacks/Tea'
      },
      {
        title: 'Varanasi - Prayagraj - Ayodhya Holy Triangle Circuit',
        subtitle: 'The ultimate 4-day pilgrimage covering Kashi Vishwanath, Triveni Sangam, and Shri Ram Janmabhoomi',
        duration: '4 Days / 3 Nights',
        price: 11999,
        original_price: 14500,
        image_url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
        badge: 'Recommended',
        highlights: 'Kashi Darshan & Ghat Aarti, Prayagraj Triveni Sangam Holy Bath & Bade Hanuman, Ayodhya Ram Janmabhoomi Mandir, Hanuman Garhi, Saryu Aarti',
        itinerary: 'Day 1: Varanasi Arrival & Kashi Vishwanath + Evening Aarti | Day 2: Drive to Prayagraj (125 km), Sangam Boat ride, Anand Bhavan, overnight stay | Day 3: Drive to Ayodhya (165 km), Ram Mandir Darshan, Hanuman Garhi, Saryu River Aarti | Day 4: Morning Kanak Bhavan, drive back to Varanasi Airport/Station',
        inclusions: 'Dedicated AC Vehicle for all 4 days, Interstate Tolls & Driver allowances, 3-Star Hotel Stays with Breakfast, Sangam Boat Ride',
        exclusions: 'Flight/Train tickets, Personal expenses, Monument entry fees'
      },
      {
        title: 'Varanasi & Sarnath Buddhist Excursion',
        subtitle: 'Follow the footprints of Lord Buddha from Varanasi to Sarnath Deer Park and Chaukhandi Stupa',
        duration: '1 Full Day',
        price: 2199,
        original_price: 2800,
        image_url: 'https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&w=800&q=80',
        badge: 'Popular',
        highlights: 'Dhamek Stupa, Sarnath Archaeological Museum, Ashoka Pillar, Mulagandha Kuti Vihar, Thai Buddha Statue',
        itinerary: '09:00 AM Hotel Pickup -> 09:45 AM Arrival at Sarnath -> 10:00 AM Dhamek Stupa & Ruins -> 12:00 PM Archaeological Museum -> 01:30 PM Lunch -> 02:45 PM Tibetan & Japanese Monasteries -> 04:30 PM Return drive to Varanasi Hotel',
        inclusions: 'AC Cab round-trip from Varanasi, Fuel, Tolls, Driver fee',
        exclusions: 'Museum & Stupa entry tickets (₹25)'
      }
    ];

    for (const p of packages) {
      await db.run(
        `INSERT INTO packages (title, subtitle, duration, price, original_price, image_url, badge, highlights, itinerary, inclusions, exclusions)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.title, p.subtitle, p.duration, p.price, p.original_price, p.image_url, p.badge, p.highlights, p.itinerary, p.inclusions, p.exclusions]
      );
    }
  }

  // Check if hotels already exist
  const existingHotels = await db.all('SELECT COUNT(*) as count FROM hotels');
  if (existingHotels[0].count === 0) {
    console.log('Seeding hotels...');
    const hotels = [
      {
        name: 'Ganga View Heritage Haveli',
        category: 'Ghat-side Heritage Stay',
        rating: 4.8,
        reviews_count: 248,
        price_per_night: 3499,
        distance_to_ghat: '80 meters from Dashashwamedh Ghat',
        location: 'Old Varanasi, Near Dashashwamedh',
        amenities: 'Direct Ganga View, Rooftop Restaurant, 24/7 Hot Water, Free WiFi, Pure Veg Meals',
        image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Hotel Kashi Grand Residency',
        category: '3-Star Deluxe',
        rating: 4.6,
        reviews_count: 312,
        price_per_night: 2799,
        distance_to_ghat: '450 meters from Kashi Vishwanath Temple',
        location: 'Godowlia Chowk, Varanasi',
        amenities: 'Central AC, Lift, In-house Multi-cuisine Dining, Travel Desk, Electric Kettle, Luggage Assistance',
        image_url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'BrijRama / Gateway Luxury Palace Heritage',
        category: 'Luxury Heritage 5-Star',
        rating: 4.9,
        reviews_count: 420,
        price_per_night: 8499,
        distance_to_ghat: 'Located right on Darbhanga Ghat with private boat access',
        location: 'Darbhanga Ghat, Varanasi',
        amenities: 'Royal Palace Architecture, Private Boat Transfers, Spa, Classical Evening Soiree, Luxury Buffet Breakfast',
        image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Shri Ram Pilgrims Guest House',
        category: 'Comfort Budget',
        rating: 4.4,
        reviews_count: 185,
        price_per_night: 1399,
        distance_to_ghat: '250 meters from Assi Ghat',
        location: 'Assi Ghat Road, Varanasi',
        amenities: 'AC Rooms, Clean Linens, Attached Western Bath, Rooftop Yoga Terrace, Free High-speed WiFi',
        image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80'
      }
    ];

    for (const h of hotels) {
      await db.run(
        `INSERT INTO hotels (name, category, rating, reviews_count, price_per_night, distance_to_ghat, location, amenities, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [h.name, h.category, h.rating, h.reviews_count, h.price_per_night, h.distance_to_ghat, h.location, h.amenities, h.image_url]
      );
    }
  }

  console.log('✅ Database initialization & seeding complete!');
};

// If run directly via node
if (require.main === module) {
  seedData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = seedData;
