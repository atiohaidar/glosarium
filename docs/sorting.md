# Cara Kerja Sorting Berdasarkan Dependency

## 🎯 Apa Itu Sorting Dependency?

Bayangkan Anda sedang belajar memasak. Untuk membuat **Kue Coklat**, Anda butuh:
- **Bahan Dasar** (tepung, telur, gula) → Belajar dulu
- **Adonan** (campur bahan dasar) → Belajar setelah tahu bahan dasar
- **Kue Coklat** (panggang adonan) → Belajar terakhir

Sorting dependency bekerja seperti ini: **konsep dasar dulu, konsep kompleks belakangan**.

## 📚 Contoh di Glosarium

Misal kita punya istilah:
- **Blockchain** = Teknologi dasar
- **Smart Contract** = "Program yang berjalan di blockchain"
- **Canister** = "Smart contract di Internet Computer"

**Masalah:** Jika Canister menggunakan Smart Contract, maka Smart Contract HARUS dipelajari dulu!

## 🔍 Algoritma Topological Sort (Mudah Dipahami)

### **Langkah 1: Cari "Siapa Butuh Siapa"** 🔗

Kita baca definisi setiap istilah dan cari istilah lain yang disebutkan:

```
Blockchain: "Teknologi..." → Tidak sebut istilah lain
Smart Contract: "Program di blockchain" → Sebut "blockchain"
Canister: "Smart contract di IC" → Sebut "smart contract"
```

### **Langkah 2: Buat "Peta Kebutuhan"** 🗺️

```
Blockchain → Tidak butuh apa-apa (fundamental)
Smart Contract → Butuh Blockchain
Canister → Butuh Smart Contract
```

### **Langkah 3: Hitung "Tingkat Kebutuhan"** 📊

```
Blockchain: 0 kebutuhan (mulai dari sini!)
Smart Contract: 1 kebutuhan
Canister: 1 kebutuhan
```

### **Langkah 4: Urutkan seperti Memasak** 👨‍🍳

1. **Ambil yang tidak butuh apa-apa** → Blockchain ✅
2. **Hapus dari kebutuhan orang lain** → Smart Contract sekarang 0 kebutuhan
3. **Lanjutkan** → Canister sekarang 0 kebutuhan

**Hasil:** Blockchain → Smart Contract → Canister ✅

## 🎯 Mengapa Penting?

### **Belajar Bertahap** 📖
- ❌ Jangan langsung belajar Canister tanpa tahu Smart Contract
- ✅ Pelajari Blockchain dulu, lalu Smart Contract, baru Canister

### **Tidak Kacau** 🧹
- Otomatis deteksi dependencies
- Tidak perlu manual atur urutan
- Update otomatis saat definisi berubah

## 🔧 Cara Kerja Teknis (Bagi Yang Ingin Tahu)

### **Kahn's Algorithm** ⚙️

1. **Build Graph**: A → B artinya "A butuh B"
2. **Hitung Indegree**: Berapa banyak yang dibutuhkan
3. **Queue**: Mulai dari yang indegree = 0
4. **Process**: Kurangi indegree tetangga, lanjutkan

### **Kode Sederhana** 💻

```javascript
// Pseudocode
function topologicalSort(terms) {
  // 1. Cari dependencies
  const graph = buildDependencyGraph(terms);

  // 2. Hitung indegree
  const indegree = calculateIndegree(graph);

  // 3. Queue untuk yang tidak butuh apa-apa
  const queue = getZeroIndegreeTerms(indegree);

  // 4. Process sampai selesai
  const result = [];
  while (queue.length > 0) {
    const current = queue.shift();
    result.push(current);

    // Kurangi kebutuhan tetangga
    for (let neighbor of graph[current]) {
      indegree[neighbor]--;
      if (indegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
  }

  return result;
}
```

## 🎉 Kesimpulan

**Topological Sort** membuat glosarium seperti **buku pelajaran terstruktur**:

1. **Konsep Dasar** → Blockchain, Variable, Function
2. **Konsep Menengah** → Smart Contract, Class, Algorithm
3. **Konsep Lanjutan** → Canister, DeFi, Complex Systems

**Hasil:** Pembelajaran yang **logis dan efektif**! 🚀📚

---

*File ini dibuat untuk menjelaskan algoritma sorting dependency dengan bahasa yang mudah dipahami orang awam.*