const { assert } = require('chai')
const sinon = require('sinon')
const validator = require('../../src/utils/webhook-signature.validator')

describe('Validate webhook signature', () => {
    const request = {
        headers: {
            'x-nexus-webhook-signature':
                '42f0ce462b5631af387660d11c7b93a1d8ae209d',
        },
        body: {
            field: 'value',
        }
    }

    const response = {
        headers: {
            'Content-Type':
                'application/json'
        }
    }

    it('Well formed body with signature', async () => {
        process.env.LIFECYCLE_SECRET_KEY = 'secret'
        const nextFn = sinon.spy()
        await validator.validate(request, response, nextFn)
        assert.equal(nextFn.callCount, 1)
        assert.isUndefined(nextFn.err)
        nextFn.restore
    })

    it('Invalidate a well formed body with incorrect signature', async () => {
        process.env.LIFECYCLE_SECRET_KEY = 'notsecret'
        const nextFn = sinon.spy()
        await validator.validate(request, response, nextFn)
        assert.equal(nextFn.callCount, 1)
        assert.equal(nextFn.args[0][0].type, 'auth')
        nextFn.restore
    })

    it('Empty secret key', async () => {
        const nextFn = sinon.spy()
        await validator.validate(request, response, nextFn)
        assert.equal(nextFn.callCount, 1)
        assert.equal(nextFn.args[0][0].type, 'auth')
        nextFn.restore
    })
})
