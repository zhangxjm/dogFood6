package com.quantum.core;

import java.io.Serializable;
import java.util.Arrays;

public class ComplexNumber implements Serializable {
    private final double real;
    private final double imaginary;

    public ComplexNumber(double real, double imaginary) {
        this.real = real;
        this.imaginary = imaginary;
    }

    public static ComplexNumber ZERO = new ComplexNumber(0, 0);
    public static ComplexNumber ONE = new ComplexNumber(1, 0);
    public static ComplexNumber I = new ComplexNumber(0, 1);

    public ComplexNumber add(ComplexNumber other) {
        return new ComplexNumber(this.real + other.real, this.imaginary + other.imaginary);
    }

    public ComplexNumber subtract(ComplexNumber other) {
        return new ComplexNumber(this.real - other.real, this.imaginary - other.imaginary);
    }

    public ComplexNumber multiply(ComplexNumber other) {
        double newReal = this.real * other.real - this.imaginary * other.imaginary;
        double newImag = this.real * other.imaginary + this.imaginary * other.real;
        return new ComplexNumber(newReal, newImag);
    }

    public ComplexNumber multiply(double scalar) {
        return new ComplexNumber(this.real * scalar, this.imaginary * scalar);
    }

    public ComplexNumber conjugate() {
        return new ComplexNumber(this.real, -this.imaginary);
    }

    public double magnitude() {
        return Math.sqrt(real * real + imaginary * imaginary);
    }

    public double magnitudeSquared() {
        return real * real + imaginary * imaginary;
    }

    public ComplexNumber normalize() {
        double mag = magnitude();
        if (mag == 0) return ZERO;
        return new ComplexNumber(real / mag, imaginary / mag);
    }

    public double getReal() { return real; }
    public double getImaginary() { return imaginary; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ComplexNumber)) return false;
        ComplexNumber that = (ComplexNumber) o;
        return Math.abs(that.real - real) < 1e-10 &&
               Math.abs(that.imaginary - imaginary) < 1e-10;
    }

    @Override
    public String toString() {
        if (Math.abs(imaginary) < 1e-10) {
            return String.format("%.4f", real);
        }
        if (Math.abs(real) < 1e-10) {
            return String.format("%.4fi", imaginary);
        }
        if (imaginary > 0) {
            return String.format("%.4f+%.4fi", real, imaginary);
        }
        return String.format("%.4f-%.4fi", real, Math.abs(imaginary));
    }
}
