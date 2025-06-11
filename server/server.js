const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 

const app = express();
app.use(cors());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images')));

const db = mysql.createConnection({
    host: "localhost",
    user: 'root',
    password: '',
    database: 'zynk-store'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to database as id ' + db.threadId);
});

app.get('/', (req, res) => {
    return res.json("From Backend Side");
});

app.get('/brands', (req, res) => {
    const sql = "SELECT * FROM brands";
    db.query(sql, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    });
});

app.get('/models', (req, res) => {
    const { brand_id } = req.query;
    const sql = "SELECT * FROM models WHERE brand_id = ?";
    db.query(sql, [brand_id], (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    });
});

app.get('/vendors', (req, res) => {
    const sql = "SELECT * FROM vendors";
    db.query(sql, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    });
});

app.get('/cards', (req, res) => {
    const { brand_id, model_id, vendor_id, sort } = req.query;
    let sql = `
        SELECT cards.*, models.name AS model_name, vendors.name AS vendor_name, brands.name AS brand_name
        FROM cards
        JOIN models ON cards.model_id = models.id
        JOIN vendors ON cards.vendor_id = vendors.id
        JOIN brands ON models.brand_id = brands.id
        WHERE 1
    `;
    const params = [];

    if (brand_id) {
        sql += " AND models.brand_id = ?";
        params.push(brand_id);
    }

    if (model_id) {
        sql += " AND cards.model_id = ?";
        params.push(model_id);
    }

    if (vendor_id) {
        const vendorIds = vendor_id.split(',').map(id => parseInt(id));
        sql += ` AND cards.vendor_id IN (${vendorIds.map(() => '?').join(',')})`;
        params.push(...vendorIds);
    }

    if (sort === 'asc') {
        sql += " ORDER BY cards.price ASC";
    } else if (sort === 'desc') {
        sql += " ORDER BY cards.price DESC";
    } else {
        sql += " ORDER BY cards.id DESC";
    }

    db.query(sql, params, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    });
});

app.get('/brands_cpu', (req, res) => {
    const sql = "SELECT * FROM brands_cpu";
    db.query(sql, (err, data) => {
        if (err) {
            console.error('Error fetching CPU brands:', err);
            return res.status(500).json({ message: "Error fetching CPU brands", error: err });
        }
        return res.json(data);
    });
});

app.get('/families_cpu', (req, res) => {
    const { brand_cpu_id } = req.query;
    let sql = "SELECT * FROM families_cpu";
    const params = [];

    if (brand_cpu_id) {
        sql += " WHERE brand_cpu_id = ?";
        params.push(brand_cpu_id);
    }

    db.query(sql, params, (err, data) => {
        if (err) {
            console.error('Error fetching CPU families:', err);
            return res.status(500).json({ message: "Error fetching CPU families", error: err });
        }
        return res.json(data);
    });
});

app.get('/models_cpu', (req, res) => {
    const { family_cpu_id } = req.query;
    let sql = "SELECT * FROM models_cpu";
    const params = [];

    if (family_cpu_id) {
        sql += " WHERE family_cpu_id = ?";
        params.push(family_cpu_id);
    }

    db.query(sql, params, (err, data) => {
        if (err) {
            console.error('Error fetching CPU models:', err);
            return res.status(500).json({ message: "Error fetching CPU models", error: err });
        }
        return res.json(data);
    });
});

app.get('/sockets_cpu', (req, res) => {
    const sql = "SELECT * FROM sockets_cpu";
    db.query(sql, (err, data) => {
        if (err) {
            console.error('Error fetching CPU sockets:', err);
            return res.status(500).json({ message: "Error fetching CPU sockets", error: err });
        }
        return res.json(data);
    });
});

app.get('/cores_cpu', (req, res) => {
    const sql = "SELECT * FROM cores_cpu";
    db.query(sql, (err, data) => {
        if (err) {
            console.error('Error fetching CPU cores:', err);
            return res.status(500).json({ message: "Error fetching CPU cores", error: err });
        }
        return res.json(data);
    });
});

app.get('/cpus', (req, res) => {
    const { brand_cpu_id, family_cpu_id, model_cpu_id, socket_cpu_id, cores_cpu_id, sort } = req.query;
    let sql = `
        SELECT cpus.*,
               families_cpu.name AS family_cpu_name,
               sockets_cpu.name AS socket_cpu_name,
               cores_cpu.number AS cores_cpu_number,
               brands_cpu.name AS brand_cpu_name,
               models_cpu.name AS model_cpu_name
        FROM cpus
        JOIN families_cpu ON cpus.family_cpu_id = families_cpu.id
        JOIN sockets_cpu ON cpus.socket_cpu_id = sockets_cpu.id
        JOIN cores_cpu ON cpus.cores_cpu_id = cores_cpu.id
        JOIN brands_cpu ON families_cpu.brand_cpu_id = brands_cpu.id
        LEFT JOIN models_cpu ON cpus.model_cpu_id = models_cpu.id
        WHERE 1
    `;
    const params = [];

    if (brand_cpu_id) {
        sql += " AND families_cpu.brand_cpu_id = ?";
        params.push(brand_cpu_id);
    }

    if (family_cpu_id) {
        sql += " AND cpus.family_cpu_id = ?";
        params.push(family_cpu_id);
    }

    if (model_cpu_id) {
        sql += " AND cpus.model_cpu_id = ?";
        params.push(model_cpu_id);
    }

    if (socket_cpu_id) {
        const socketIds = socket_cpu_id.split(',').map(id => parseInt(id));
        sql += ` AND cpus.socket_cpu_id IN (${socketIds.map(() => '?').join(',')})`;
        params.push(...socketIds);
    }

    if (cores_cpu_id) {
        const coresIds = cores_cpu_id.split(',').map(id => parseInt(id));
        sql += ` AND cpus.cores_cpu_id IN (${coresIds.map(() => '?').join(',')})`;
        params.push(...coresIds);
    }

    if (sort === 'asc') {
        sql += " ORDER BY cpus.price ASC";
    } else if (sort === 'desc') {
        sql += " ORDER BY cpus.price DESC";
    } else {
        sql += " ORDER BY cpus.id DESC";
    }

    db.query(sql, params, (err, data) => {
        if (err) {
            console.error('Error fetching CPUs:', err);
            return res.status(500).json({ message: "Error fetching CPUs", error: err });
        }
        return res.json(data);
    });
});

app.get('/brands_mb', (req, res) => {
    const sql = "SELECT * FROM brands_mb";
    db.query(sql, (err, data) => {
        if (err) {
            console.error('Error fetching MB brands:', err);
            return res.status(500).json({ message: "Error fetching MB brands", error: err });
        }
        return res.json(data);
    });
});

app.get('/models_mb', (req, res) => {
    const { brand_mb_id } = req.query;
    let sql = "SELECT * FROM models_mb";
    const params = [];

    if (brand_mb_id) {
        sql += " WHERE brand_mb_id = ?";
        params.push(brand_mb_id);
    }

    db.query(sql, params, (err, data) => {
        if (err) {
            console.error('Error fetching MB models:', err);
            return res.status(500).json({ message: "Error fetching MB models", error: err });
        }
        return res.json(data);
    });
});

app.get('/sockets_mb', (req, res) => {
    const sql = "SELECT * FROM sockets_mb";
    db.query(sql, (err, data) => {
        if (err) {
            console.error('Error fetching MB sockets:', err);
            return res.status(500).json({ message: "Error fetching MB sockets", error: err });
        }
        return res.json(data);
    });
});

app.get('/form_factors_mb', (req, res) => {
    const sql = "SELECT * FROM form_factors_mb";
    db.query(sql, (err, data) => {
        if (err) {
            console.error('Error fetching MB form factors:', err);
            return res.status(500).json({ message: "Error fetching MB form factors", error: err });
        }
        return res.json(data);
    });
});

app.get('/memory_types_mb', (req, res) => {
    const sql = "SELECT * FROM memory_types_mb";
    db.query(sql, (err, data) => {
        if (err) {
            console.error('Error fetching MB memory types:', err);
            return res.status(500).json({ message: "Error fetching MB memory types", error: err });
        }
        return res.json(data);
    });
});

app.get('/motherboards', (req, res) => {
    const { brand_mb_id, model_mb_id, socket_mb_id, form_factor_mb_id, memory_type_mb_id, sort } = req.query;
    let sql = `
        SELECT motherboards.*,
               brands_mb.name AS brand_mb_name,
               models_mb.name AS model_mb_name,
               sockets_mb.name AS socket_mb_name,
               form_factors_mb.name AS form_factor_mb_name,
               memory_types_mb.name AS memory_type_mb_name
        FROM motherboards
        JOIN brands_mb ON motherboards.brand_mb_id = brands_mb.id
        LEFT JOIN models_mb ON motherboards.model_mb_id = models_mb.id
        JOIN sockets_mb ON motherboards.socket_mb_id = sockets_mb.id
        JOIN form_factors_mb ON motherboards.form_factor_mb_id = form_factors_mb.id
        JOIN memory_types_mb ON motherboards.memory_type_mb_id = memory_types_mb.id
        WHERE 1
    `;
    const params = [];

    if (brand_mb_id) {
        sql += " AND motherboards.brand_mb_id = ?";
        params.push(brand_mb_id);
    }

    if (model_mb_id) {
        sql += " AND motherboards.model_mb_id = ?";
        params.push(model_mb_id);
    }

    if (socket_mb_id) {
        const socketIds = socket_mb_id.split(',').map(id => parseInt(id));
        sql += ` AND motherboards.socket_mb_id IN (${socketIds.map(() => '?').join(',')})`;
        params.push(...socketIds);
    }

    if (form_factor_mb_id) {
        const formFactorIds = form_factor_mb_id.split(',').map(id => parseInt(id));
        sql += ` AND motherboards.form_factor_mb_id IN (${formFactorIds.map(() => '?').join(',')})`;
        params.push(...formFactorIds);
    }

    if (memory_type_mb_id) {
        const memoryTypeIds = memory_type_mb_id.split(',').map(id => parseInt(id));
        sql += ` AND motherboards.memory_type_mb_id IN (${memoryTypeIds.map(() => '?').join(',')})`;
        params.push(...memoryTypeIds);
    }

    if (sort === 'asc') {
        sql += " ORDER BY motherboards.price ASC";
    } else if (sort === 'desc') {
        sql += " ORDER BY motherboards.price DESC";
    } else {
        sql += " ORDER BY motherboards.id DESC";
    }

    db.query(sql, params, (err, data) => {
        if (err) {
            console.error('Error fetching Motherboards:', err);
            return res.status(500).json({ message: "Error fetching Motherboards", error: err });
        }
        return res.json(data);
    });
});

// --- RAM ROUTES ---

// Brands for RAM
app.get('/brands_ram', (req, res) => {
    const sql = "SELECT * FROM brands_ram";
    db.query(sql, (err, data) => {
        if (err) {
            console.error('Error fetching RAM brands:', err);
            return res.status(500).json({ message: "Error fetching RAM brands", error: err });
        }
        return res.json(data);
    });
});

// Memory Sizes for RAM
app.get('/memory_sizes_ram', (req, res) => {
    const sql = "SELECT * FROM memory_sizes_ram";
    db.query(sql, (err, data) => {
        if (err) {
            console.error('Error fetching RAM memory sizes:', err);
            return res.status(500).json({ message: "Error fetching RAM memory sizes", error: err });
        }
        return res.json(data);
    });
});

// Memory Types for RAM
app.get('/memory_types_ram', (req, res) => {
    const sql = "SELECT * FROM memory_types_ram";
    db.query(sql, (err, data) => {
        if (err) {
            console.error('Error fetching RAM memory types:', err);
            return res.status(500).json({ message: "Error fetching RAM memory types", error: err });
        }
        return res.json(data);
    });
});

// Frequencies for RAM
app.get('/frequencies_ram', (req, res) => {
    const sql = "SELECT * FROM frequencies_ram";
    db.query(sql, (err, data) => {
        if (err) {
            console.error('Error fetching RAM frequencies:', err);
            return res.status(500).json({ message: "Error fetching RAM frequencies", error: err });
        }
        return res.json(data);
    });
});

// Main route for RAM modules with filtering and sorting
app.get('/ram_modules', (req, res) => {
    const { brand_ram_id, memory_size_ram_id, memory_type_ram_id, frequency_ram_id, sort } = req.query;
    let sql = `
        SELECT ram_modules.*,
               brands_ram.name AS brand_ram_name,
               memory_sizes_ram.size AS memory_size_ram_value,
               memory_types_ram.name AS memory_type_ram_name,
               frequencies_ram.value AS frequency_ram_value
        FROM ram_modules
        JOIN brands_ram ON ram_modules.brand_ram_id = brands_ram.id
        JOIN memory_sizes_ram ON ram_modules.memory_size_ram_id = memory_sizes_ram.id
        JOIN memory_types_ram ON ram_modules.memory_type_ram_id = memory_types_ram.id
        JOIN frequencies_ram ON ram_modules.frequency_ram_id = frequencies_ram.id
        WHERE 1
    `;
    const params = [];

    if (brand_ram_id) {
        sql += " AND ram_modules.brand_ram_id = ?";
        params.push(brand_ram_id);
    }

    if (memory_size_ram_id) {
        const memorySizeIds = memory_size_ram_id.split(',').map(id => parseInt(id));
        sql += ` AND ram_modules.memory_size_ram_id IN (${memorySizeIds.map(() => '?').join(',')})`;
        params.push(...memorySizeIds);
    }

    if (memory_type_ram_id) {
        const memoryTypeIds = memory_type_ram_id.split(',').map(id => parseInt(id));
        sql += ` AND ram_modules.memory_type_ram_id IN (${memoryTypeIds.map(() => '?').join(',')})`;
        params.push(...memoryTypeIds);
    }

    if (frequency_ram_id) {
        const frequencyIds = frequency_ram_id.split(',').map(id => parseInt(id));
        sql += ` AND ram_modules.frequency_ram_id IN (${frequencyIds.map(() => '?').join(',')})`;
        params.push(...frequencyIds);
    }

    if (sort === 'asc') {
        sql += " ORDER BY ram_modules.price ASC";
    } else if (sort === 'desc') {
        sql += " ORDER BY ram_modules.price DESC";
    } else {
        sql += " ORDER BY ram_modules.id DESC"; // Default sort by popular (newest added)
    }

    db.query(sql, params, (err, data) => {
        if (err) {
            console.error('Error fetching RAM modules:', err);
            return res.status(500).json({ message: "Error fetching RAM modules", error: err });
        }
        return res.json(data);
    });
});

// --- END RAM ROUTES ---

// JWT Middleware для аутентифікації користувача
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // Перевіряємо, чи існує заголовок "Authorization" і чи починається він з "Bearer "
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (token == null) {
        // Якщо токена немає, повертаємо 401 Unauthorized
        return res.status(401).json({ message: "Відсутній токен авторизації." });
    }

    // Ваш секретний ключ JWT. ЗАМІНІТЬ ЦЕ НА РЕАЛЬНИЙ, СКЛАДНИЙ КЛЮЧ У ПРОДАКШНІ!
    const JWT_SECRET = 'your_jwt_secret_for_zynk_store';

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // Якщо токен недійсний або закінчився, повертаємо 403 Forbidden
            console.error('JWT verification failed:', err);
            return res.status(403).json({ message: "Недійсний або закінчився термін дії токена." });
        }
        // Якщо токен дійсний, додаємо інформацію про користувача до об'єкта запиту
        req.user = user;
        next(); // Продовжуємо до наступного middleware або обробника маршруту
    });
};


// Маршрут для оформлення замовлення
// Використовуємо authenticateToken для захисту маршруту, щоб тільки авторизовані користувачі могли оформляти замовлення.
// Якщо вам потрібно дозволити оформлення замовлень неавторизованим користувачам, просто видаліть `authenticateToken` звідси.
app.post('/place_order', authenticateToken, (req, res) => {
    const {
        product_id,
        product_name,
        product_price,
        product_type, // Тип продукту (наприклад, 'cpu', 'videocard', 'motherboard', 'ram')
        quantity,
        total_amount,
        customer_name,
        customer_email,
        customer_phone,
        delivery_address,
        payment_method
    } = req.body;

    // Отримуємо user_id з об'єкта `req.user`, який був доданий middleware `authenticateToken`.
    // Якщо користувач неавторизований (і middleware було видалено), user_id буде NULL в базі даних.
    const user_id = req.user ? req.user.id : null;

    // Базова валідація вхідних даних
    if (!product_id || !product_name || product_price === undefined || !quantity || total_amount === undefined || !customer_name || !customer_email || !customer_phone || !delivery_address || !payment_method) {
        return res.status(400).json({ message: "Будь ласка, заповніть всі обов'язкові поля замовлення." });
    }
    if (quantity <= 0 || total_amount < 0 || product_price < 0) {
        return res.status(400).json({ message: "Кількість та ціна повинні бути позитивними числами." });
    }

    // Запит SQL для вставки нового замовлення в таблицю `orders`
    const sql = `
        INSERT INTO orders (
            user_id,
            product_id,
            product_name,
            product_price,
            product_type,
            quantity,
            total_amount,
            customer_name,
            customer_email,
            customer_phone,
            delivery_address,
            payment_method,
            order_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `;

    // Виконуємо запит до бази даних
    db.query(sql,
        [
            user_id, // Може бути null, якщо користувач неавторизований
            product_id,
            product_name,
            product_price,
            product_type,
            quantity,
            total_amount,
            customer_name,
            customer_email,
            customer_phone,
            delivery_address,
            payment_method
        ],
        (err, result) => {
            if (err) {
                console.error('Помилка при оформленні замовлення в БД:', err);
                return res.status(500).json({ message: "Внутрішня помилка сервера при оформленні замовлення.", error: err.message });
            }
            // Успішна відповідь, повертаємо ID щойно створеного замовлення
            return res.status(201).json({ message: "Замовлення успішно оформлено!", orderId: result.insertId });
        }
    );
});


app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        db.query(sql, [name, email, hashedPassword], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: "Email already exists" });
                }
                console.error('Error registering user:', err);
                return res.status(500).json(err);
            }
            return res.status(201).json({ message: "User registered successfully" });
        });
    } catch (error) {
        console.error('Server error during registration:', error);
        return res.status(500).json({ message: "Server error" });
    }
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error('Error during login query:', err);
            return res.status(500).json(err);
        }
        if (results.length === 0) return res.status(400).json({ message: "Invalid email or password" });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

        const token = jwt.sign({ id: user.id }, 'your_jwt_secret_for_zynk_store', { expiresIn: '1d' });

        return res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    });
});

app.listen(8108, () => {
    console.log("Server is running on port 8108");
});