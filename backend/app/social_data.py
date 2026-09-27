# Справочник университетов и IT-факультетов
UNIVERSITIES = [
    {
        "id": "hse",
        "name": "НИУ ВШЭ",
        "faculties": ["Факультет Компьютерных Наук (ФКН)", "МИЭМ", "Бизнес-информатика", "ФКМД"]
    },
    {
        "id": "msu",
        "name": "МГУ им. М.В. Ломоносова",
        "faculties": ["ВМК (Вычмат и Кибернетика)", "Механико-математический", "ФКИ", "Физфак"]
    },
    {
        "id": "bmstu",
        "name": "МГТУ им. Н.Э. Баумана",
        "faculties": ["ИУ (Информатика и Системы Управления)", "ИБМ", "РК (Робототехника)", "ФН"]
    },
    {
        "id": "itmo",
        "name": "Университет ИТМО",
        "faculties": ["ФИТиП (Информационные Технологии)", "КТ (Компьютерные Технологии)", "ТИНТ", "ИБиТС"]
    },
    {
        "id": "mipt",
        "name": "МФТИ (Физтех)",
        "faculties": ["ФПМИ (Прикладная Математика и Информатика)", "ФАКТ", "ФРКТ", "ЛФИ"]
    },
    {
        "id": "spbu",
        "name": "СПбГУ",
        "faculties": ["МКН (Математика и Компьютерные Науки)", "ПМ-ПУ", "Математико-механический"]
    },
    {
        "id": "polytech",
        "name": "СПбПУ (Политех)",
        "faculties": ["ИКНТ (Кибербезопасность и IT)", "ИММиТ", "Физмех"]
    },
    {
        "id": "urfu",
        "name": "УрФУ",
        "faculties": ["ИРИТ-РТФ", "ИнЭУ", "ФТИ"]
    },
    {
        "id": "kfu",
        "name": "КФУ",
        "faculties": ["ИТИС (ИТ и Интеллектуальные Системы)", "ИВМИИТ", "Институт Физики"]
    }
]

# Начальный рейтинг ВУЗов по вычислительной мощности (FLOPs)
INITIAL_UNIVERSITY_LEADERBOARD = [
    {"rank": 1, "university": "НИУ ВШЭ", "total_compute_flops": 184500, "active_students": 1420, "is_leader": True},
    {"rank": 2, "university": "Университет ИТМО", "total_compute_flops": 169200, "active_students": 1280, "is_leader": False},
    {"rank": 3, "university": "МГТУ им. Н.Э. Баумана", "total_compute_flops": 154100, "active_students": 1150, "is_leader": False},
    {"rank": 4, "university": "МФТИ (Физтех)", "total_compute_flops": 148900, "active_students": 980, "is_leader": False},
    {"rank": 5, "university": "МГУ им. М.В. Ломоносова", "total_compute_flops": 139400, "active_students": 1040, "is_leader": False},
    {"rank": 6, "university": "СПбГУ", "total_compute_flops": 112300, "active_students": 760, "is_leader": False},
    {"rank": 7, "university": "СПбПУ (Политех)", "total_compute_flops": 98500, "active_students": 690, "is_leader": False},
    {"rank": 8, "university": "КФУ", "total_compute_flops": 84200, "active_students": 520, "is_leader": False},
    {"rank": 9, "university": "УрФУ", "total_compute_flops": 76100, "active_students": 480, "is_leader": False},
]

# Топ-10 лучших студентов
INITIAL_STUDENT_LEADERBOARD = [
    {"rank": 1, "student_name": "Artem_ML", "university": "Университет ИТМО", "pet_name": "Neural-Hydra", "pet_level": 24, "accuracy": 98.4},
    {"rank": 2, "student_name": "Sofi_Data", "university": "НИУ ВШЭ", "pet_name": "GPT-Titan", "pet_level": 22, "accuracy": 97.9},
    {"rank": 3, "student_name": "Cyber_Dmitry", "university": "МФТИ (Физтех)", "pet_name": "Attention-God", "pet_level": 21, "accuracy": 97.1},
    {"rank": 4, "student_name": "Alex_K", "university": "МГТУ им. Н.Э. Баумана", "pet_name": "FastAPI-Wolf", "pet_level": 19, "accuracy": 95.8},
    {"rank": 5, "student_name": "Maria_V", "university": "МГУ им. М.В. Ломоносова", "pet_name": "ResNet-Fox", "pet_level": 18, "accuracy": 94.6},
    {"rank": 6, "student_name": "Ivan_Dev", "university": "СПбГУ", "pet_name": "Dense-Beast", "pet_level": 16, "accuracy": 93.2},
    {"rank": 7, "student_name": "Max_Root", "university": "СПбПУ (Политех)", "pet_name": "Cyber-Hound", "pet_level": 15, "accuracy": 92.5},
    {"rank": 8, "student_name": "Elena_KFU", "university": "КФУ", "pet_name": "Vision-Cat", "pet_level": 14, "accuracy": 91.8},
    {"rank": 9, "student_name": "Daniil_IT", "university": "УрФУ", "pet_name": "Linear-Snake", "pet_level": 13, "accuracy": 90.4},
    {"rank": 10, "student_name": "Nikita_Coder", "university": "НИУ ВШЭ", "pet_name": "Mini-Shiba", "pet_level": 12, "accuracy": 89.5},
]
