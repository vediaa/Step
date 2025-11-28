import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const { token } = req.cookies; //sitedeki cokkieden token bilgisini aldı
  if (!token) {
    return res.json({
      success: false,
      message: "Yetkilendirme başarısız tekrar giriş yapın",
    });
  }
  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    if (tokenDecode.id) {
      if (!req.body) req.body = {}; //değiti body
      req.body.userId = tokenDecode.id;
    } else {
      return res.json({
        success: false,
        message: "Yetkilendirme başarısız tekrar giriş yapın",
      });
    }

    next(); //tüm şartlar sağlandı token kullanıcıya ait
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export default userAuth;
