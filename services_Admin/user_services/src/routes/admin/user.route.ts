import {Router} from "express";
import * as controller from '../../controllers/admin/user.controller';
import { authMiddleware } from "../../middlewares/auth.middleware";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

const router: Router = Router();

// Áp dụng middleware xác thực cho tất cả route
router.use(authMiddleware);

router.get('/', controller.index);
router.get('/users', controller.indexUsers);
router.get('/users/:id', controller.showUser);
router.patch('/users/ban/:id', controller.banUser);
router.patch('/users/unban/:id', controller.unbanUser);

router.get('/:id', controller.show);
router.post('/create', controller.create);
router.put('/update/:id', upload.single("image"), controller.update);
router.delete('/delete/:id', controller.destroy);

export const userAdminRoutes: Router = router