import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';

const Custom_AGFilter = forwardRef((props, ref) => {
    const [operator, setOperator] = useState('equals');
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('');

    useImperativeHandle(ref, () => ({
        isFilterActive() {
            return operator === 'between'
                ? value1 !== '' && value2 !== ''
                : value1 !== '';
        },

        doesFilterPass(params) {
            const field = props.colDef.field;
            const rawValue = params.data[field];
            let cellValue = rawValue;

            if (typeof cellValue === 'string') {
                cellValue = parseFloat(cellValue.replace('%', '').trim());
            } else {
                cellValue = Number(cellValue);
            }

            if (isNaN(cellValue)) return false;

            const val1 = parseFloat(value1);
            const val2 = parseFloat(value2);

            switch (operator) {
                case 'equals':
                    return cellValue === val1;
                case 'notEqual':
                    return cellValue !== val1;
                case 'greaterThan':
                    return cellValue > val1;
                case 'greaterThanOrEqual':
                    return cellValue >= val1;
                case 'lessThan':
                    return cellValue < val1;
                case 'lessThanOrEqual':
                    return cellValue <= val1;
                case 'between':
                    return cellValue >= val1 && cellValue <= val2;
                case 'blank':
                    return cellValue === null || cellValue === undefined || cellValue === '';
                case 'notBlank':
                    return cellValue !== null && cellValue !== undefined && cellValue !== '';
                default:
                    return true;
            }
        },

        getModel() {
            return { operator, value1, value2 };
        },

        setModel(model) {
            if (model) {
                setOperator(model.operator);
                setValue1(model.value1);
                setValue2(model.value2 || '');
            } else {
                setOperator('equals');
                setValue1('');
                setValue2('');
            }
        },
    }));

    useEffect(() => {
        props.filterChangedCallback(); // now triggers *after* value1 updates
    }, [value1, value2, operator]);

    return (
        <div style={{ padding: 5 }}>
            <select
                value={operator}
                onChange={(e) => {
                    setOperator(e.target.value);
                    props.filterChangedCallback();
                }}
            >
                <option value="equals">Equals</option>
                <option value="notEqual">Does not equal</option>
                <option value="greaterThan">Greater than</option>
                <option value="greaterThanOrEqual">Greater than or equal to</option>
                <option value="lessThan">Less than</option>
                <option value="lessThanOrEqual">Less than or equal to</option>
                <option value="between">Between</option>
                <option value="blank">Blank</option>
                <option value="notBlank">Not blank</option>
            </select>
            <div style={{ marginTop: 5 }}>
                <input
                    type="text" // ← changed from "number"
                    value={value1}
                    disabled={operator === 'blank' || operator === 'notBlank'}
                    onChange={(e) => {
                        const sanitized = e.target.value.replace(/[^\d.-]/g, ''); // allow digits, dot, and minus
                        setValue1(sanitized);
                        props.filterChangedCallback();
                    }}
                    placeholder="Value"
                />

                {/* <input
                    type="number"
                    value={value1}
                    disabled={operator === 'blank' || operator === 'notBlank'}
                    onChange={(e) => {
                        setValue1(e.target.value);
                        props.filterChangedCallback();
                    }}
                    placeholder="Value"
                /> */}
                {operator === 'between' && (
                    <input
                        type="number"
                        value={value2}
                        onChange={(e) => {
                            setValue2(e.target.value);
                            props.filterChangedCallback();
                        }}
                        placeholder="and"
                        style={{ marginLeft: 5 }}
                    />
                )}
            </div>
        </div>
    );
});

export default Custom_AGFilter;
