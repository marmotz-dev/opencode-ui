var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createOpencode } from '@opencode-ai/sdk';
export class OpencodeService {
    getClient() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client) {
                const { client } = yield createOpencode();
                this.client = client;
            }
            return this.client;
        });
    }
    getCurrentSessions() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getClient()).session.list();
        });
    }
    getSessionMessages(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getClient()).session.messages({
                path: {
                    id: sessionId,
                },
            });
        });
    }
    deleteSession(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getClient()).session.delete({
                path: {
                    id: sessionId,
                },
            });
        });
    }
    createSession() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getClient()).session.create();
        });
    }
}
//# sourceMappingURL=opencode.service.js.map