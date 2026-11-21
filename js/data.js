/* ============================================================
   Fallback content + live content loader.
   Fallback keeps the site fully visible when Supabase is not
   configured or temporarily unavailable.
   ============================================================ */
(function (global) {
  "use strict";

  var FALLBACK = {
    profiles: [{
      id: "profile-main",
      name: "Imran Rafi",
      photo_url: "assets/profile.svg",
      headline_bn: "প্রযুক্তি উৎসাহী · জীবনভর শিক্ষার্থী · নির্মাতা",
      headline_en: "Technology Enthusiast · Lifelong Learner · Maker",
      intro_bn: "আমি ইলেকট্রনিক্স, মাইক্রোকন্ট্রোলার, এআই, ওয়েব ডেভেলপমেন্ট ও অটোমেশন নিয়ে exploration করি — দৈনন্দিন কৌতূহলকে বাস্তব প্রকল্পে রূপ দিই।",
      intro_en: "I explore electronics, microcontrollers, AI, web development and automation — turning everyday curiosity into hands-on projects.",
      about_bn: "আমি একজন প্রযুক্তি উৎসাহী ও শিক্ষার্থী, যিনি জিনিসগুলো কীভাবে কাজ করে তা বোঝাতে ভালোবাসি। ছোট মাইক্রোকন্ট্রোলার ও সার্কিট থেকে শুরু করে বুদ্ধিমান সফটওয়্যার ও ওয়েব — আমার কৌতূহল সব জায়গায় ছড়িয়ে আছে।",
      about_en: "I'm a technology enthusiast and learner with a genuine love for understanding how things work. My curiosity spans from tiny microcontrollers and circuits to intelligent software and the web.",
      location_bn: "বাংলাদেশ",
      location_en: "Bangladesh",
      learning_goal_bn: "ক্রমাগত শিখছি: ইলেকট্রনিক্স, প্রোগ্রামিং, ওয়েব ও এআই।",
      learning_goal_en: "Continuously learning: electronics, programming, web and AI."
    }],
    site_settings: [{
      id: "settings-main",
      site_name: "Imran Rafi",
      title_bn: "ইমরান রাফি — প্রযুক্তি উৎসাহী, শিক্ষার্থী ও নির্মাতা",
      title_en: "Imran Rafi — Technology Enthusiast, Learner & Maker",
      description_bn: "ইমরান রাফির ব্যক্তিগত পোর্টফলিও — ইলেকট্রনিক্স, এআই ও ওয়েব ডেভেলপমেন্ট নিয়ে বাস্তব প্রকল্প।",
      description_en: "Personal portfolio of Imran Rafi — hands-on projects in electronics, AI and web development.",
      og_image_url: "assets/og-image.png",
      footer_bn: "HTML, CSS ও JavaScript দিয়ে তৈরি · GitHub Pages-এ deployed",
      footer_en: "Built with HTML, CSS & JavaScript · Deployed on GitHub Pages",
      copyright: "Imran Rafi",
      accent_color: "#3b82f6",
      default_language: "bn"
    }],
    interests: [
      { id: "i1", title_bn: "আরডুইনো", title_en: "Arduino", description_bn: "আরডুইনো দিয়ে ইন্টারঅ্যাকটিভ প্রকল্প তৈরি।", description_en: "Building interactive projects with the board that started it all.", icon: "🔌", category: "microcontrollers", visible: true, sort_order: 1 },
      { id: "i2", title_bn: "ESP8266", title_en: "ESP8266", description_bn: "ওয়াই-ফাই যোগ করে IoT নিয়ে পরীক্ষা।", description_en: "Adding Wi-Fi to everyday projects and experimenting with IoT.", icon: "📡", category: "microcontrollers", visible: true, sort_order: 2 },
      { id: "i3", title_bn: "ESP32", title_en: "ESP32", description_bn: "সেন্সিং, কানেক্টিভিটি ও অটোমেশনের শক্তিশালী মাইক্রোকন্ট্রোলার।", description_en: "Powerful microcontrollers for sensing, connectivity and automation.", icon: "🧩", category: "microcontrollers", visible: true, sort_order: 3 },
      { id: "i4", title_bn: "ইলেকট্রনিক্স মেরামত", title_en: "Electronics Repair", description_bn: "সার্কিটের সমস্যা খুঁজে পুরনো হার্ডওয়্যার পুনরুদ্ধার।", description_en: "Troubleshooting circuits and bringing old hardware back to life.", icon: "🛠️", category: "electronics", visible: true, sort_order: 4 },
      { id: "i5", title_bn: "এআই টুল", title_en: "AI Tools", description_bn: "শিখতে ও তৈরি করতে ব্যবহারিক এআই টুল ব্যবহার।", description_en: "Exploring practical AI to learn faster and create more.", icon: "🤖", category: "ai", visible: true, sort_order: 5 },
      { id: "i6", title_bn: "ওয়েব ডেভেলপমেন্ট", title_en: "Web Development", description_bn: "দ্রুত, অ্যাক্সেসিবল ও সুন্দর ওয়েবসাইট তৈরি।", description_en: "Crafting fast, accessible and good-looking sites from scratch.", icon: "🌐", category: "web", visible: true, sort_order: 6 },
      { id: "i7", title_bn: "প্রোগ্রামিং", title_en: "Programming", description_bn: "C/C++, Python ও JavaScript-এ পরিচ্ছন্ন কোড অনুশীলন।", description_en: "Practising clean code across C/C++, Python and JavaScript.", icon: "💻", category: "programming", visible: true, sort_order: 7 },
      { id: "i8", title_bn: "ভিডিও ক্রিয়েশন", title_en: "Video Creation", description_bn: "ধারণা ও প্রকল্পকে দেখার মতো গল্পে রূপ দেওয়া।", description_en: "Turning ideas and projects into stories worth watching.", icon: "🎬", category: "creative projects", visible: true, sort_order: 8 },
      { id: "i9", title_bn: "DIY প্রকল্প", title_en: "DIY Projects", description_bn: "নিজের হাতে বাস্তব কিছু তৈরির আনন্দ।", description_en: "The thrill of making something real with my own two hands.", icon: "🧰", category: "electronics", visible: true, sort_order: 9 }
    ],
    skills: [
      { id: "s1", name_bn: "আরডুইনো", name_en: "Arduino", category: "electronics", level: 80, visible: true, sort_order: 1 },
      { id: "s2", name_bn: "ESP32 / ESP8266", name_en: "ESP32 / ESP8266", category: "electronics", level: 70, visible: true, sort_order: 2 },
      { id: "s3", name_bn: "সার্কিট ও মেরামত", name_en: "Circuit basics & repair", category: "electronics", level: 60, visible: true, sort_order: 3 },
      { id: "s4", name_bn: "C / C++", name_en: "C / C++", category: "programming", level: 70, visible: true, sort_order: 4 },
      { id: "s5", name_bn: "পাইথন", name_en: "Python", category: "programming", level: 65, visible: true, sort_order: 5 },
      { id: "s6", name_bn: "জাভাস্ক্রিপ্ট", name_en: "JavaScript", category: "programming", level: 60, visible: true, sort_order: 6 },
      { id: "s7", name_bn: "এআই টুল", name_en: "AI tools & assistants", category: "ai", level: 75, visible: true, sort_order: 7 },
      { id: "s8", name_bn: "প্রম্পটিং ও ওয়ার্কফ্লো", name_en: "Prompting & workflows", category: "ai", level: 70, visible: true, sort_order: 8 },
      { id: "s9", name_bn: "হোম অটোমেশন", name_en: "Home automation", category: "ai", level: 60, visible: true, sort_order: 9 },
      { id: "s10", name_bn: "HTML ও CSS", name_en: "HTML & CSS", category: "web", level: 80, visible: true, sort_order: 10 },
      { id: "s11", name_bn: "রেসপন্সিভ ডিজাইন", name_en: "Responsive design", category: "web", level: 75, visible: true, sort_order: 11 },
      { id: "s12", name_bn: "জাভাস্ক্রিপ্ট ফান্ডামেন্টাল", name_en: "JavaScript fundamentals", category: "web", level: 65, visible: true, sort_order: 12 }
    ],
    projects: [
      { id: "p1", title_bn: "ESP32 আবহাওয়া স্টেশন", title_en: "ESP32 Weather Station", description_bn: "তাপমাত্রা, আর্দ্রতা ও চাপের তথ্য সংগ্রহ করে সহজ ড্যাশবোর্ডে প্রদর্শন।", description_en: "Live environmental sensing with a compact web dashboard and wireless data updates.", image_url: "assets/project-1.svg", category: "electronics", section: "embedded", technologies: ["ESP32", "Sensors", "IoT"], project_url: "", github_url: "", featured: true, visible: true, sort_order: 1 },
      { id: "p2", title_bn: "আরডুইনো স্মার্ট হোম", title_en: "Arduino Smart Home", description_bn: "রিলে দিয়ে আলো ও যন্ত্রপাতি নিয়ন্ত্রণ — ম্যানুয়াল ও সেন্সর ভিত্তিক অটোমেশন।", description_en: "Relay-based control of lights and appliances, combining manual switches with sensor-driven automation.", image_url: "", category: "electronics", section: "embedded", technologies: ["Arduino", "Relays", "Automation"], project_url: "", github_url: "", featured: false, visible: true, sort_order: 2 },
      { id: "p3", title_bn: "ESP8266 IoT নোড", title_en: "ESP8266 IoT Node", description_bn: "MQTT-এর মাধ্যমে ওয়াই-ফাই সেন্সর নোড থেকে লাইভ ডেটা প্রকাশ।", description_en: "A compact Wi-Fi sensor node publishing live readings over MQTT for remote monitoring.", image_url: "", category: "electronics", section: "embedded", technologies: ["ESP8266", "MQTT", "Wi-Fi"], project_url: "", github_url: "", featured: false, visible: true, sort_order: 3 },
      { id: "p4", title_bn: "মেরামত ও রিভার্স ইঞ্জিনিয়ারিং", title_en: "Repair & Reverse Engineering", description_bn: "ত্রুটিপূর্ণ বোর্ড নির্ণয় ও সিগন্যাল পথ অনুসরণ করে হার্ডওয়্যার বোঝা।", description_en: "Diagnosing faulty boards, tracing signal paths and learning how real-world hardware is designed.", image_url: "", category: "electronics", section: "embedded", technologies: ["Troubleshooting", "Soldering"], project_url: "", github_url: "", featured: false, visible: true, sort_order: 4 },
      { id: "p5", title_bn: "স্মার্ট অটোমেশন ল্যাব", title_en: "Smart Automation Lab", description_bn: "এআই-সহায়ক রুটিন যা অ্যাপ, ডেটা ও ভৌত ডিভাইসকে যুক্ত করে।", description_en: "Experimenting with AI-assisted routines that connect apps, data and physical devices.", image_url: "assets/project-2.svg", category: "ai", section: "ai", technologies: ["AI", "Workflows", "IoT"], project_url: "", github_url: "", featured: true, visible: true, sort_order: 5 },
      { id: "p6", title_bn: "এআই টুল এক্সপ্লোরেশন", title_en: "AI Tools Exploration", description_bn: "গবেষণা, শিক্ষা ও কনটেন্ট তৈরিতে এআই সহকারী ব্যবহার।", description_en: "Testing AI assistants and generative tools to speed up research, learning and content creation.", image_url: "", category: "ai", section: "ai", technologies: ["AI tools", "Learning"], project_url: "", github_url: "", featured: false, visible: true, sort_order: 6 },
      { id: "p7", title_bn: "ওয়ার্কফ্লো অটোমেশন", title_en: "Workflow Automation", description_bn: "পুনরাবৃত্তিমূলক কাজের জন্য ছোট স্ক্রিপ্ট ও অ্যাপ সংযোগ।", description_en: "Connecting apps and small scripts to take care of repetitive digital chores.", image_url: "", category: "ai", section: "ai", technologies: ["Scripting", "Productivity"], project_url: "", github_url: "", featured: false, visible: true, sort_order: 7 },
      { id: "p8", title_bn: "ক্রিয়েটিভ এআই", title_en: "Creative AI", description_bn: "ভিডিও ধারণা ও ভিজ্যুয়ালের জন্য এআইকে সৃজনশীল সহকারী হিসেবে ব্যবহার।", description_en: "Using AI as a creative partner for video ideas, visuals and brainstorming.", image_url: "", category: "ai", section: "ai", technologies: ["Video", "Ideation"], project_url: "", github_url: "", featured: false, visible: true, sort_order: 8 },
      { id: "p9", title_bn: "রেসপন্সিভ ইন্টারফেস", title_en: "Responsive Interfaces", description_bn: "ছোট ফোন থেকে বড় ডেস্কটপ — প্রতিটি স্ক্রিনে মানানসই লেআউট।", description_en: "Mobile-first layouts that feel native on every screen size, from small phones to wide desktops.", image_url: "", category: "web", section: "web", technologies: ["HTML", "CSS", "Mobile-first"], project_url: "", github_url: "", featured: false, visible: true, sort_order: 9 },
      { id: "p10", title_bn: "ফ্রন্টএন্ড ফান্ডামেন্টাল", title_en: "Frontend Fundamentals", description_bn: "সেম্যান্টিক HTML, আধুনিক CSS ও ভ্যানিলা JavaScript।", description_en: "Semantic markup, modern CSS and vanilla JavaScript with a focus on performance and accessibility.", image_url: "", category: "web", section: "web", technologies: ["Semantic HTML", "JavaScript", "A11y"], project_url: "", github_url: "", featured: false, visible: true, sort_order: 10 },
      { id: "p11", title_bn: "ব্যক্তিগত পোর্টফলিও", title_en: "Personal Portfolio", description_bn: "GitHub Pages-এ ডিজাইন ও ডেপ্লয় করা এই রেসপন্সিভ পোর্টফলিও।", description_en: "This responsive, lightweight portfolio — designed and deployed with GitHub Pages.", image_url: "assets/project-3.svg", category: "web", section: "web", technologies: ["HTML", "CSS", "JavaScript"], project_url: "", github_url: "", featured: true, visible: true, sort_order: 11 },
      { id: "p12", title_bn: "UI/UX চিন্তা", title_en: "UI/UX Thinking", description_bn: "পরিচ্ছন্ন হায়ারার্কি ও মাইক্রো-ইন্টারঅ্যাকশন যা ব্যবহার সহজ করে।", description_en: "Clear hierarchy, thoughtful interactions and details that make using a site feel effortless.", image_url: "", category: "web", section: "web", technologies: ["Design", "UX"], project_url: "", github_url: "", featured: false, visible: true, sort_order: 12 }
    ],
    gallery: [
      { id: "g1", image_url: "assets/gallery-1.svg", caption_bn: "আমার ওয়ার্কবেঞ্চ", caption_en: "My workbench", category: "Electronics", visible: true, sort_order: 1 },
      { id: "g2", image_url: "assets/gallery-2.svg", caption_bn: "ইলেকট্রনিক্স প্রকল্প", caption_en: "Electronics projects", category: "Electronics", visible: true, sort_order: 2 },
      { id: "g3", image_url: "assets/gallery-3.svg", caption_bn: "মাইক্রোকন্ট্রোলার", caption_en: "Microcontrollers", category: "Hardware", visible: true, sort_order: 3 },
      { id: "g4", image_url: "assets/gallery-4.svg", caption_bn: "তৈরি ও পরীক্ষা", caption_en: "Building & testing", category: "Hardware", visible: true, sort_order: 4 },
      { id: "g5", image_url: "assets/gallery-5.svg", caption_bn: "সৃজনশীল সেটআপ", caption_en: "Creative setup", category: "Creative", visible: true, sort_order: 5 },
      { id: "g6", image_url: "assets/gallery-6.svg", caption_bn: "একটি মুহূর্ত", caption_en: "A moment", category: "Creative", visible: true, sort_order: 6 }
    ],
    education: [
      { id: "e1", institution_bn: "ক্রমাগত স্ব-শিক্ষা", institution_en: "Continuous Self-Learning", level_bn: "চলমান", level_en: "Ongoing", department_bn: "ইলেকট্রনিক্স · প্রোগ্রামিং · ওয়েব · এআই", department_en: "Electronics · Programming · Web · AI", start_year: "", end_year: "", description_bn: "অনলাইন রিসোর্স, ডকুমেন্টেশন ও ছোট প্রকল্পের মাধ্যমে হাতে-কলমে শেখা।", description_en: "Learning by doing: online resources, documentation, experiments and small projects.", visible: true, sort_order: 1 },
      { id: "e2", institution_bn: "আপনার স্কুল / কলেজ", institution_en: "Your school / college", level_bn: "শিক্ষাগত যোগ্যতা", level_en: "Formal Education", department_bn: "বিভাগ", department_en: "Department", start_year: "", end_year: "", description_bn: "এই এন্ট্রিটি আপনার নিজের তথ্য দিয়ে সম্পাদনা করুন।", description_en: "Replace this entry with your real qualification, institution and years.", visible: false, sort_order: 2 },
      { id: "e3", institution_bn: "কোর্স ও সার্টিফিকেশন", institution_en: "Courses & Certifications", level_bn: "কোর্স", level_en: "Courses", department_bn: "প্ল্যাটফর্ম", department_en: "Platform", start_year: "", end_year: "", description_bn: "সম্পন্ন করা কোর্স বা ওয়ার্কশপ এখানে যোগ করুন।", description_en: "Add any completed courses, certificates or workshops here.", visible: false, sort_order: 3 }
    ],
    social_links: [
      { id: "so1", platform: "GitHub", url: "https://github.com/rmd734412-web", icon: "github", visible: true, sort_order: 1 },
      { id: "so2", platform: "LinkedIn", url: "", icon: "linkedin", visible: false, sort_order: 2 },
      { id: "so3", platform: "YouTube", url: "", icon: "youtube", visible: false, sort_order: 3 },
      { id: "so4", platform: "Instagram", url: "", icon: "instagram", visible: false, sort_order: 4 },
      { id: "so5", platform: "Facebook", url: "", icon: "facebook", visible: false, sort_order: 5 },
      { id: "so6", platform: "Email", url: "", icon: "email", visible: false, sort_order: 6 }
    ]
  };

  var QUERIES = {
    profiles: { order: null },
    site_settings: { order: null },
    projects: { order: "sort_order.asc" },
    gallery: { order: "sort_order.asc" },
    skills: { order: "sort_order.asc" },
    education: { order: "sort_order.asc" },
    interests: { order: "sort_order.asc" },
    social_links: { order: "sort_order.asc" }
  };

  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

  async function load(preview) {
    var result = clone(FALLBACK);
    if (!global.AppSupabase || !global.AppSupabase.configured()) {
      return { data: result, live: false, error: null };
    }
    try {
      var names = Object.keys(QUERIES);
      var responses = await Promise.all(names.map(function (name) {
        var q = QUERIES[name];
        var opts = { admin: Boolean(preview), columns: "*" };
        if (q.order) opts.order = q.order;
        if (!preview && name !== "profiles" && name !== "site_settings") {
          opts.filters = ["visible=eq.true"];
        }
        return global.AppSupabase.select(name, opts);
      }));
      names.forEach(function (name, index) {
        var rows = responses[index];
        if (Array.isArray(rows) && rows.length) result[name] = rows;
      });
      return { data: result, live: true, error: null };
    } catch (error) {
      return { data: result, live: false, error: error && error.message ? error.message : String(error) };
    }
  }

  global.AppData = { load: load, fallback: FALLBACK, tables: Object.keys(QUERIES) };
})(window);
