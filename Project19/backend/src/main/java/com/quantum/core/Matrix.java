package com.quantum.core;

import java.io.Serializable;

public class Matrix implements Serializable {
    private final ComplexNumber[][] data;
    private final int rows;
    private final int cols;

    public Matrix(int rows, int cols) {
        this.rows = rows;
        this.cols = cols;
        this.data = new ComplexNumber[rows][cols];
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                data[i][j] = ComplexNumber.ZERO;
            }
        }
    }

    public Matrix(ComplexNumber[][] data) {
        this.rows = data.length;
        this.cols = data[0].length;
        this.data = new ComplexNumber[rows][cols];
        for (int i = 0; i < rows; i++) {
            System.arraycopy(data[i], 0, this.data[i], 0, cols);
        }
    }

    public static Matrix identity(int size) {
        Matrix result = new Matrix(size, size);
        for (int i = 0; i < size; i++) {
            result.data[i][i] = ComplexNumber.ONE;
        }
        return result;
    }

    public ComplexNumber get(int row, int col) {
        return data[row][col];
    }

    public void set(int row, int col, ComplexNumber value) {
        data[row][col] = value;
    }

    public int getRows() { return rows; }
    public int getCols() { return cols; }

    public Matrix multiply(Matrix other) {
        if (this.cols != other.rows) {
            throw new IllegalArgumentException("Matrix dimensions do not match for multiplication");
        }
        Matrix result = new Matrix(this.rows, other.cols);
        for (int i = 0; i < this.rows; i++) {
            for (int j = 0; j < other.cols; j++) {
                ComplexNumber sum = ComplexNumber.ZERO;
                for (int k = 0; k < this.cols; k++) {
                    sum = sum.add(this.data[i][k].multiply(other.data[k][j]));
                }
                result.data[i][j] = sum;
            }
        }
        return result;
    }

    public ComplexNumber[] multiplyVector(ComplexNumber[] vector) {
        if (this.cols != vector.length) {
            throw new IllegalArgumentException("Matrix and vector dimensions do not match");
        }
        ComplexNumber[] result = new ComplexNumber[this.rows];
        for (int i = 0; i < this.rows; i++) {
            result[i] = ComplexNumber.ZERO;
            for (int j = 0; j < this.cols; j++) {
                result[i] = result[i].add(this.data[i][j].multiply(vector[j]));
            }
        }
        return result;
    }

    public Matrix tensorProduct(Matrix other) {
        Matrix result = new Matrix(this.rows * other.rows, this.cols * other.cols);
        for (int i = 0; i < this.rows; i++) {
            for (int j = 0; j < this.cols; j++) {
                for (int k = 0; k < other.rows; k++) {
                    for (int l = 0; l < other.cols; l++) {
                        result.data[i * other.rows + k][j * other.cols + l] =
                            this.data[i][j].multiply(other.data[k][l]);
                    }
                }
            }
        }
        return result;
    }

    public ComplexNumber[][] getData() {
        ComplexNumber[][] copy = new ComplexNumber[rows][cols];
        for (int i = 0; i < rows; i++) {
            System.arraycopy(data[i], 0, copy[i], 0, cols);
        }
        return copy;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < rows; i++) {
            sb.append("[");
            for (int j = 0; j < cols; j++) {
                sb.append(data[i][j].toString());
                if (j < cols - 1) sb.append(", ");
            }
            sb.append("]\n");
        }
        return sb.toString();
    }
}
