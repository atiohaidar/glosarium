# 📚 Glosarium

<div align="center">
  <img src="./public/PP-Tio.jpg" alt="Glosarium Logo" width="80" height="80" style="border-radius: 50%; margin-bottom: 20px;">
  <h3>Aplikasi Modern untuk Mengelola Istilah Teknis</h3>
  <p>Platform interaktif untuk belajar dan mengorganisir kosakata teknis dengan fitur visualisasi dependensi</p>

  ![React](https://img.shields.io/badge/React-19.1.1-blue.svg)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)
  ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-blue.svg)
  ![Vite](https://img.shields.io/badge/Vite-5.x-purple.svg)
  ![D3.js](https://img.shields.io/badge/D3.js-7.x-orange.svg)
</div>

---

## ✨ Fitur Utama

### 🎯 **Manajemen Istilah**
- **Kategori Terorganisir**: Kelompokkan istilah berdasarkan kategori
- **Definisi Lengkap**: Setiap istilah memiliki definisi, contoh, dan referensi
- **Pencarian Cepat**: Temukan istilah dengan fitur search real-time
- **Edit & Hapus**: Kelola istilah dengan mudah

### 📊 **Visualisasi Data**
- **Grafik Dependensi**: Lihat hubungan antar istilah dalam bentuk graf interaktif
- **D3.js Integration**: Visualisasi yang smooth dan responsive
- **Highlighting**: Fokus pada istilah tertentu saat mencari

### 🎮 **Mode Quiz**
- **Uji Pengetahuan**: Test pemahaman Anda tentang istilah teknis
- **Progress Tracking**: Pantau skor dan waktu pengerjaan
- **Random Questions**: Pertanyaan acak dari berbagai kategori

### 🎨 **Pengalaman Pengguna**
- **Dark/Light Mode**: Toggle tema sesuai preferensi
- **Responsive Design**: Optimal di desktop dan mobile
- **Smooth Animations**: Transisi yang halus dan modern
- **Intuitive UI**: Antarmuka yang mudah digunakan

### ⚙️ **Manajemen Data**
- **Import/Export**: Cadangkan dan pulihkan data dalam format JSON
- **Bulk Operations**: Tambah banyak istilah sekaligus
- **Data Persistence**: Data tersimpan di browser lokal

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 atau lebih baru)
- npm atau yarn

### Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd glosarium
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Buka browser**
   ```
   http://localhost:5173
   ```

### Build untuk Production

```bash
npm run build
npm run preview
```

---

## 📖 Cara Penggunaan

### 1. **Navigasi Kategori**
- Gunakan sidebar untuk memilih kategori istilah
- Klik tombol hamburger untuk toggle sidebar di mobile

### 2. **Mencari Istilah**
- Gunakan search box di header untuk mencari istilah
- Pencarian real-time berdasarkan judul dan definisi

### 3. **Melihat Detail Istilah**
- Klik pada term card untuk melihat detail lengkap
- Link otomatis akan menghubungkan istilah terkait

### 4. **Mode Tampilan**
- **List View**: Tampilan kartu untuk browsing
- **Graph View**: Visualisasi hubungan antar istilah

### 5. **Mengatur Urutan**
- **Dependency**: Urutkan berdasarkan hubungan dependensi
- **Alphabetical**: Urutkan berdasarkan abjad
- Toggle arah urutan (ascending/descending)

### 6. **Mode Tema**
- Klik ikon matahari/bulan untuk toggle dark/light mode
- Tema tersimpan secara otomatis

### 7. **Fitur Quiz**
- Klik tombol floating quiz (✓) di kanan bawah
- Jawab pertanyaan dan lihat skor akhir

### 8. **Mengelola Data**
- Klik ikon dokumen di kiri bawah untuk data management
- Import/export data dalam format JSON
- Tambah kategori dan istilah baru

---

## 🛠️ Tech Stack

### Frontend Framework
- **React 19.1.1** - UI library modern dengan concurrent features
- **TypeScript** - Type safety dan developer experience yang lebih baik
- **Vite** - Build tool yang sangat cepat

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **Custom CSS Variables** - Tema dinamis untuk dark/light mode
- **Responsive Design** - Mobile-first approach

### Data Visualization
- **D3.js** - Library untuk visualisasi data interaktif
- **Force-directed Graph** - Algoritma untuk layout graf yang natural

### State Management
- **React Hooks** - useState, useEffect, useMemo, useCallback
- **Local Storage** - Persistensi data dan preferensi tema

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

---

## 📁 Struktur Project

```
glosarium/
├── public/
│   └── PP-Tio.jpg          # Logo aplikasi
├── src/
│   ├── components/         # Komponen React
│   │   ├── TermCard.tsx    # Kartu istilah
│   │   ├── QuizFlow.tsx    # Komponen quiz
│   │   ├── DependencyGraph.tsx # Visualisasi graf
│   │   ├── Modal.tsx       # Modal dialog
│   │   ├── DataManagement.tsx # Manajemen data
│   │   └── icons.tsx       # Icon components
│   ├── hooks/
│   │   └── useGlossary.ts  # Custom hook untuk data
│   ├── types.ts            # TypeScript type definitions
│   ├── App.tsx             # Komponen utama
│   └── index.tsx           # Entry point
├── package.json            # Dependencies & scripts
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite configuration
└── tailwind.config.js      # Tailwind CSS config
```

---

## 🎯 Fitur Detail

### **Smart Search**
- Pencarian real-time tanpa delay
- Highlight hasil pencarian di graf
- Filter berdasarkan judul dan konten definisi

### **Interactive Graph**
- Zoom dan pan untuk navigasi
- Hover untuk melihat koneksi
- Click node untuk detail istilah
- Animasi smooth transitions

### **Quiz System**
- Pertanyaan acak dari kategori terpilih
- Timer untuk tracking waktu
- Score calculation dengan feedback
- Progress bar visual

### **Data Management**
- CRUD operations lengkap
- Bulk import via text atau file
- JSON export/import
- Data validation

### **Accessibility**
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Focus management

---

## 🔧 Customization

### Mengubah Tema Warna

Edit nilai CSS variables di `App.tsx`:

```typescript
// Dark theme
root.style.setProperty('--bg-primary', '#1a1a1a');
root.style.setProperty('--bg-secondary', '#2a2a2a');
root.style.setProperty('--accent', '#0ea5e9');

// Light theme
root.style.setProperty('--bg-primary', '#f8fafc');
root.style.setProperty('--bg-secondary', '#ffffff');
root.style.setProperty('--accent', '#3b82f6');
```

### Menambah Kategori Baru

Gunakan interface DataManagement atau panggil API:

```typescript
addCategory("Nama Kategori Baru");
```

### Custom Quiz Logic

Modifikasi `QuizFlow.tsx` untuk menambah tipe pertanyaan atau scoring logic.

---

## 📱 Screenshots

<div align="center">
  <img src="https://via.placeholder.com/800x400/1a1a1a/ffffff?text=Dark+Mode+View" alt="Dark Mode" width="45%" style="margin: 10px;">
  <img src="https://via.placeholder.com/800x400/f8fafc/1e293b?text=Light+Mode+View" alt="Light Mode" width="45%" style="margin: 10px;">
</div>

<div align="center">
  <img src="https://via.placeholder.com/800x400/2a2a2a/0ea5e9?text=Graph+Visualization" alt="Graph View" width="45%" style="margin: 10px;">
  <img src="https://via.placeholder.com/800x400/2a2a2a/e5e5e5?text=Quiz+Mode" alt="Quiz Mode" width="45%" style="margin: 10px;">
</div>

---

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

### Development Guidelines
- Gunakan TypeScript untuk type safety
- Ikuti ESLint rules
- Test di multiple browsers
- Maintain responsive design
- Dokumentasikan perubahan signifikan

---


---

## 🙏 Acknowledgments

- **React Team** - Untuk framework yang powerful
- **Tailwind CSS** - Untuk utility-first approach
- **D3.js Community** - Untuk visualisasi data
- **Vite Team** - Untuk development experience yang cepat

---

<div align="center">
  <p>Dibuat dengan AI Studio dari Google dari Github Copilot Agent Mode make Grok Code Fast untuk model nya</p>
  <p>
    <a href="#features">Fitur</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#usage">Cara Pakai</a> •
    <a href="#tech-stack">Tech Stack</a>
  </p>
</div>
