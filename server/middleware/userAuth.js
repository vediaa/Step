import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  let token;

  // 1. Önce Header kontrolü (Frontend'den Bearer Token olarak gelirse)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // 2. Eğer Header yoksa Cookie kontrolü
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Token hiç bulunamadıysa
  if (!token) {
    return res.json({
      success: false,
      message: "Yetkilendirme başarısız, token bulunamadı.",
    });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    if (tokenDecode && tokenDecode.id) {
      req.user = { id: tokenDecode.id }; // Controller'ın beklediği yer
      next(); 
    } else {
      return res.json({
        success: false,
        message: "Geçersiz token yapısı.",
      });
    }
  } catch (error) {
    return res.json({ success: false, message: "Token doğrulanamadı: " + error.message });
  }
};

export default userAuth;