// All 15 Helpr cities (matched to withhelpr.com)
// `img` references either a local file under /images/cities/<slug>.webp
// (drop one in to override) or falls back to a curated Unsplash URL.
const u = (id, w = 1200) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

export const cities = [
  { slug: 'ahmedabad',   name: 'Ahmedabad',   tagline: 'Trusted house help across Ahmedabad.',  img: u('1599661046289-e31897846e41'), areas: ['Bodakdev', 'Vastrapur', 'Satellite', 'SG Highway', 'Prahlad Nagar', 'Maninagar'] },
  { slug: 'bangalore',   name: 'Bangalore',   tagline: 'Trusted house help across Bengaluru.',  img: u('1596176530529-78163a4f7af2'), areas: ['Indiranagar', 'Koramangala', 'HSR Layout', 'Whitefield', 'Jayanagar', 'Electronic City', 'Marathahalli'] },
  { slug: 'chennai',     name: 'Chennai',     tagline: 'Trusted house help across Chennai.',    img: u('1582510003544-4d00b7f74220'), areas: ['T Nagar', 'Adyar', 'Velachery', 'OMR', 'Anna Nagar', 'Nungambakkam'] },
  { slug: 'delhi',       name: 'Delhi',       tagline: 'Trusted house help across Delhi.',      img: u('1587474260584-136574528ed5'), areas: ['Saket', 'Vasant Kunj', 'Hauz Khas', 'Greater Kailash', 'Dwarka', 'Rohini'] },
  { slug: 'faridabad',   name: 'Faridabad',   tagline: 'Trusted house help across Faridabad.',  img: u('1469474968028-56623f02e42e'), areas: ['Sector 14', 'Sector 21', 'NIT', 'Greater Faridabad', 'Sector 85'] },
  { slug: 'ghaziabad',   name: 'Ghaziabad',   tagline: 'Trusted house help across Ghaziabad.',  img: u('1517824806704-9040b037703b'), areas: ['Indirapuram', 'Vaishali', 'Vasundhara', 'Raj Nagar', 'Kaushambi'] },
  { slug: 'gurgaon',     name: 'Gurgaon',     tagline: 'Trusted house help across Gurgaon.',    img: u('1597040663332-c14f87aaa5e0'), areas: ['DLF Phase 1-5', 'Sector 56', 'Sector 57', 'Suncity', 'Sohna Road', 'Golf Course Road', 'Sector 65', 'Sushant Lok'] },
  { slug: 'hyderabad',   name: 'Hyderabad',   tagline: 'Trusted house help across Hyderabad.',  img: u('1572437999322-cd14ab8bee4e'), areas: ['HiTech City', 'Gachibowli', 'Madhapur', 'Banjara Hills', 'Jubilee Hills', 'Kondapur'] },
  { slug: 'jaipur',      name: 'Jaipur',      tagline: 'Trusted house help across Jaipur.',     img: u('1599661046827-dacde6976549'), areas: ['Malviya Nagar', 'Vaishali Nagar', 'C-Scheme', 'Mansarovar', 'Jagatpura'] },
  { slug: 'kolkata',     name: 'Kolkata',     tagline: 'Trusted house help across Kolkata.',    img: u('1558431382-27e303142255'), areas: ['Salt Lake', 'New Town', 'Park Street', 'Ballygunge', 'Behala'] },
  { slug: 'mumbai',      name: 'Mumbai',      tagline: 'Trusted house help across Mumbai.',     img: u('1570168007204-dfb528c6958f'), areas: ['Andheri', 'Bandra', 'Powai', 'Lower Parel', 'Worli', 'Goregaon', 'Malad', 'Juhu'] },
  { slug: 'navi-mumbai', name: 'Navi Mumbai', tagline: 'Trusted house help across Navi Mumbai.', img: u('1567157577867-05ccb1388e66'), areas: ['Vashi', 'Nerul', 'Belapur', 'Kharghar', 'Airoli', 'Seawoods'] },
  { slug: 'noida',       name: 'Noida',       tagline: 'Trusted house help across Noida.',      img: u('1605649487212-47bdab064df7'), areas: ['Sector 18', 'Sector 50', 'Sector 62', 'Sector 76', 'Sector 137', 'Greater Noida'] },
  { slug: 'pune',        name: 'Pune',        tagline: 'Trusted house help across Pune.',       img: u('1567527054488-2e96f3c4e5f9'), areas: ['Koregaon Park', 'Kothrud', 'Hinjewadi', 'Baner', 'Viman Nagar', 'Wakad', 'Aundh'] },
  { slug: 'thane',       name: 'Thane',       tagline: 'Trusted house help across Thane.',      img: u('1582510003544-4d00b7f74220'), areas: ['Ghodbunder Road', 'Hiranandani Estate', 'Majiwada', 'Kasarvadavali', 'Manpada'] }
]

export const findCity = (slug) => cities.find(c => c.slug === slug)
