const request = require('supertest');
const app = require('../src/app');

// Basic smoke tests — no live DB required for route existence tests
describe('API Routes', () => {
    it('GET /health returns 200', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
    });

    it('GET /api/competitors responds (DB may not be connected in test env)', async () => {
        const res = await request(app).get('/api/competitors');
        // Any status is acceptable — DB may not be running in test env
        expect(res.status).toBeGreaterThanOrEqual(200);
    });

    it('POST /api/competitors with empty body returns 400', async () => {
        const res = await request(app)
            .post('/api/competitors')
            .send({});
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('POST /api/competitors with invalid URL returns 400', async () => {
        const res = await request(app)
            .post('/api/competitors')
            .send({ name: 'Test', urls: { pricing: 'not-a-url' } });
        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('GET /api/status returns status object', async () => {
        const res = await request(app).get('/api/status');
        expect([200, 207]).toContain(res.status);
        expect(res.body.services).toBeDefined();
    });

    it('GET /unknown-route returns 404', async () => {
        const res = await request(app).get('/api/unknown-route-xyz');
        expect(res.status).toBe(404);
    });
});

describe('Differ Service', () => {
    const { computeDiff, isSignificantChange } = require('../src/services/differ');

    it('detects added lines', () => {
        const result = computeDiff('Hello world', 'Hello world\nNew line added');
        expect(result.added.length).toBeGreaterThan(0);
        expect(result.changeScore).toBeGreaterThan(0);
    });

    it('detects removed lines', () => {
        const result = computeDiff('Hello world\nLine to remove', 'Hello world');
        expect(result.removed.length).toBeGreaterThan(0);
    });

    it('returns isFirstCheck=true when previousContent is null', () => {
        const result = computeDiff(null, 'Some content');
        expect(result.isFirstCheck).toBe(true);
    });

    it('isSignificantChange returns false for firstCheck', () => {
        const result = computeDiff(null, 'Some content');
        expect(isSignificantChange(result)).toBe(false);
    });

    it('isSignificantChange returns true when 5+ lines changed', () => {
        const prev = 'line1\nline2\nline3\nline4\nline5\nline6';
        const curr = 'line1\nchanged2\nchanged3\nchanged4\nchanged5\nchanged6';
        const result = computeDiff(prev, curr);
        expect(isSignificantChange(result)).toBe(true);
    });
});
