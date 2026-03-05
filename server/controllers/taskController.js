import Task from "../models/task.js";

// Görev Oluştur
export const createTask = async (req, res) => {
  try {
    const { text, date, notificationDate } = req.body;

    // Validasyon
    if (!text || !date) {
      return res.status(400).json({ message: "Metin ve tarih zorunludur!" });
    }

    // Tarih formatı kontrolü (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        message: "Geçersiz tarih formatı! YYYY-MM-DD olmalı.",
      });
    }


    console.log("İstek geldi, Kullanıcı bilgisi:", req.user);
    // Görev oluştur
    const task = await Task.create({
      userId: req.user.id, // auth middleware'den gelecek
      text: text.trim(),
      date,
      completed: false,
      notificationDate: notificationDate || null,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Görev oluşturma hatası:", error);
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
};

// Kullanıcının Tüm Görevlerini Getir (veya Tarihe göre filtrele)
export const getTasks = async (req, res) => {
  try {
    const { date, month, year } = req.query;

    let query = { userId: req.user.id };

    if (date) {
      // Belirli bir tarihteki görevler
      query.date = date;
    } else if (month && year) {
      // Belirli bir aydaki görevler (örn: 2024-12)
      const regex = new RegExp(`^${year}-${month.padStart(2, "0")}`);
      query.date = { $regex: regex };
    }

    const tasks = await Task.find(query)
      .sort({ date: 1, createdAt: -1 }) // Tarihe göre, sonra yeniden eskiye
      .select("-__v");

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Görevleri getirme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Tarihe Göre Gruplu Görevleri Getir
export const getTasksGroupedByDate = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id })
      .sort({ date: 1, createdAt: -1 })
      .select("-__v");

    // Tarihe göre grupla
    const groupedTasks = tasks.reduce((acc, task) => {
      const date = task.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(task);
      return acc;
    }, {});

    res.status(200).json(groupedTasks);
  } catch (error) {
    console.error("Gruplu görevleri getirme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Tek Bir Görevi Getir
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ message: "Görev bulunamadı" });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Görev getirme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Görev Güncelle
export const updateTask = async (req, res) => {
  try {
    const { text, date, completed, notificationDate } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        ...(text !== undefined && { text: text.trim() }),
        ...(date !== undefined && { date }),
        ...(completed !== undefined && { completed }),
        ...(notificationDate !== undefined && { notificationDate }),
      },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Görev bulunamadı" });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Görev güncelleme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Görev Tamamlama Durumunu Değiştir
export const toggleTaskCompletion = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ message: "Görev bulunamadı" });
    }

    task.completed = !task.completed;
    await task.save();

    res.status(200).json(task);
  } catch (error) {
    console.error("Görev tamamlama hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Görev Sil
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ message: "Görev bulunamadı" });
    }

    res.status(200).json({ message: "Görev başarıyla silindi" });
  } catch (error) {
    console.error("Görev silme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Tamamlanmamış Görevleri Getir (Bugün ve öncesi)
export const getIncompleteTasks = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const tasks = await Task.find({
      userId: req.user.id,
      completed: false,
      date: { $lte: today }, // Bugün veya önceki tarihler
    })
      .sort({ date: 1 })
      .select("-__v");

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Tamamlanmamış görevleri getirme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// İstatistikler
export const getTaskStats = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments({ userId: req.user.id });
    const completedTasks = await Task.countDocuments({
      userId: req.user.id,
      completed: true,
    });
    const incompleteTasks = totalTasks - completedTasks;

    const today = new Date().toISOString().split("T")[0];
    const todayTasks = await Task.countDocuments({
      userId: req.user.id,
      date: today,
    });
    const todayCompleted = await Task.countDocuments({
      userId: req.user.id,
      date: today,
      completed: true,
    });

    res.status(200).json({
      totalTasks,
      completedTasks,
      incompleteTasks,
      todayTasks,
      todayCompleted,
      completionRate:
        totalTasks > 0
          ? ((completedTasks / totalTasks) * 100).toFixed(2)
          : 0,
    });
  } catch (error) {
    console.error("İstatistik hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};