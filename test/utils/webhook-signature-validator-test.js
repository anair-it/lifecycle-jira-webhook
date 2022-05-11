const { assert } = require('chai')
const validator = require('../../src/utils/webhook-signature-validator')

describe('Validate webhook signature', () => {
    const request = {
        headers: {
            'x-nexus-webhook-signature':
                '42f0ce462b5631af387660d11c7b93a1d8ae209d',
        },
        body: {
            field: 'value',
        },
    }

    it('Well formed body with signature', () => {
        assert.isTrue(validator.validate(request, 'secret'))
    })

    it('Invalidate a well formed body with incorrect signature', () => {
        assert.isFalse(validator.validate(request, 'notsecret'))
    })

    it('Empty secret key', () => {
        assert.isFalse(validator.validate(request, null))
    })
})
